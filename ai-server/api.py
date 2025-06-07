import os
import sys
import torch
import pickle
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path to import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model.models import NeuralCF
from model.dataset import map_graph_nodes, edges_index

app = FastAPI(title="AI Pairing API", description="API for the AI Pairing system", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize model and data globals
model = None
lid_to_idx = None
iid_to_idx = None
idx_to_lid = None
idx_to_iid = None
edges_indexes = None
edges_weights = None
edge_type = None
liquor_names = None
ingredient_names = None

# Model request/response schemas
class PairingRequest(BaseModel):
    liquor_id: int
    ingredient_id: int
    use_gpt: bool = True

class ScoreOnlyRequest(BaseModel):
    liquor_id: int
    ingredient_id: int

class ScoreOnlyResponse(BaseModel):
    score: float

class ExplanationRequest(BaseModel):
    liquor_id: int
    ingredient_id: int
    score: Optional[float] = None

class ExplanationResponse(BaseModel):
    explanation: str
    gpt_explanation: Optional[str] = None

class PairingResponse(BaseModel):
    score: float
    explanation: Optional[str] = None
    gpt_explanation: Optional[str] = None

class RecommendationRequest(BaseModel):
    liquor_id: int
    limit: int = 3  # 기본값을 3으로 변경
    use_gpt: bool = True

class RecommendationItem(BaseModel):
    ingredient_id: int
    ingredient_name: str
    score: float
    explanation: Optional[str] = None

class RecommendationResponse(BaseModel):
    liquor_id: int
    liquor_name: str
    recommendations: List[RecommendationItem]
    overall_explanation: Optional[str] = None

async def generate_gpt_explanation(liquor_name: str, ingredient_name: str, score: float) -> str:
    """Generate explanation using GPT-4o-mini API"""
    try:
        prompt = f"""
당신은 전문적인 술과 음식 페어링 전문가입니다. 다음 페어링에 대해 자세하고 전문적인 설명을 제공해주세요.

술: {liquor_name}
음식/재료: {ingredient_name}
페어링 점수: {score:.2f} (0-1 범위)

다음 관점에서 설명해주세요:
1. 이 조합이 왜 좋은지/나쁜지에 대한 구체적인 이유
2. 맛의 조화 (단맛, 쓴맛, 신맛, 감칠맛 등)
3. 향의 조화
4. 텍스처나 입안에서의 느낌
5. 추가 추천사항 (곁들일 음식이나 먹는 방법)

200자 이내로 간결하고 전문적으로 설명해주세요.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 전문적인 소믈리에이자 음식 페어링 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"GPT API Error: {str(e)}")
        return None

async def generate_recommendation_explanation(liquor_name: str, recommendations: List[RecommendationItem]) -> str:
    """Generate overall explanation for recommendations using GPT-4o-mini API"""
    try:
        top_items = recommendations[:3]  # Top 3 items
        items_text = ", ".join([f"{item.ingredient_name}({item.score:.2f})" for item in top_items])
        
        prompt = f"""
{liquor_name}과 가장 잘 어울리는 음식/재료 추천 결과에 대한 전체적인 설명을 해주세요.

추천된 상위 항목들: {items_text}

다음 관점에서 150자 이내로 간결하게 설명해주세요:
1. 이 술의 특징과 어울리는 음식의 공통점
2. 왜 이런 타입의 음식들이 추천되었는지
3. 전반적인 페어링 철학이나 원리
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 전문적인 소믈리에이자 음식 페어링 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"GPT API Error: {str(e)}")
        return None

def generate_simple_explanation(liquor_name: str, ingredient_name: str, score: float) -> str:
    """Generate simple rule-based explanation as fallback"""
    explanation = f"{liquor_name}과(와) {ingredient_name}의 페어링 점수는 {score:.2f}입니다. "
    
    if score > 0.8:
        explanation += "매우 훌륭한 조합으로, 맛과 향이 완벽하게 조화를 이룹니다."
    elif score > 0.6:
        explanation += "좋은 페어링으로, 여러 풍미 요소가 잘 어울립니다."
    elif score > 0.4:
        explanation += "무난한 조합이지만 특별함은 부족합니다."
    else:
        explanation += "이 조합은 그다지 잘 어울리지 않습니다."
    
    return explanation

@app.on_event("startup")
async def startup_event():
    global model, lid_to_idx, iid_to_idx, idx_to_lid, idx_to_iid, edges_indexes, edges_weights, edge_type, liquor_names, ingredient_names
    
    try:
        print("Loading node mappings...")
        mapping = map_graph_nodes()
        lid_to_idx = mapping['liquor']
        iid_to_idx = mapping['ingredient']
        
        # Create reverse mappings
        idx_to_lid = {v: k for k, v in lid_to_idx.items()}
        idx_to_iid = {v: k for k, v in iid_to_idx.items()}
        
        print("Loading edge indices...")
        edge_type_map = {
            'liqr-ingr': 0,
            'ingr-ingr': 1,
            'liqr-liqr': 1,
            'ingr-fcomp': 2,
            'ingr-dcomp': 2
        }
        
        edges_indexes, edges_weights, edge_type = edges_index(edge_type_map)
        
        print("Loading model...")
        model = NeuralCF(
            num_users=155,
            num_items=6498,
            emb_size=128,
            edge_index=edges_indexes,
            edge_type=edge_type,
            edge_weight=edges_weights
        )
        model.load_state_dict(torch.load("./model/checkpoint/best_model.pth", map_location=torch.device('cpu')))
        model.eval()
        
        # Load names for better responses
        print("Loading names...")
        nodes_df = pd.read_csv("./dataset/nodes_191120_updated.csv")
        liquor_names = {row['node_id']: row['name'] for _, row in nodes_df.iterrows() if row['node_type'] == 'liquor'}
        ingredient_names = {row['node_id']: row['name'] for _, row in nodes_df.iterrows() if row['node_type'] == 'ingredient'}
        
        print("Startup complete - API is ready")
    except Exception as e:
        print(f"Error during startup: {str(e)}")
        raise e

@app.get("/")
async def root():
    return {"message": "AI Pairing System API", "status": "active"}

@app.get("/health")
async def health_check():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy"}

@app.post("/score-only", response_model=ScoreOnlyResponse)
async def get_score_only(request: ScoreOnlyRequest):
    """점수만 계산하는 엔드포인트 (GPT 호출 없음)"""
    try:
        # Check if IDs exist
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        if request.ingredient_id not in iid_to_idx:
            raise HTTPException(status_code=404, detail=f"Ingredient ID {request.ingredient_id} not found")
        
        # Map IDs to indices
        liquor_idx = lid_to_idx[request.liquor_id]
        ingredient_idx = iid_to_idx[request.ingredient_id]
        
        # Get prediction
        with torch.no_grad():
            score = model(
                torch.tensor([liquor_idx]), 
                torch.tensor([ingredient_idx])
            ).item()
        
        return ScoreOnlyResponse(score=score)
    
    except Exception as e:
        print(f"Error in score prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explanation-only", response_model=ExplanationResponse)
async def get_explanation_only(request: ExplanationRequest):
    """설명만 생성하는 엔드포인트"""
    try:
        # Check if IDs exist
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        if request.ingredient_id not in iid_to_idx:
            raise HTTPException(status_code=404, detail=f"Ingredient ID {request.ingredient_id} not found")
        
        # Get names
        liquor_name = liquor_names.get(request.liquor_id, f"Liquor {request.liquor_id}")
        ingredient_name = ingredient_names.get(request.ingredient_id, f"Ingredient {request.ingredient_id}")
        
        # Use provided score or calculate it
        score = request.score
        if score is None:
            liquor_idx = lid_to_idx[request.liquor_id]
            ingredient_idx = iid_to_idx[request.ingredient_id]
            with torch.no_grad():
                score = model(
                    torch.tensor([liquor_idx]), 
                    torch.tensor([ingredient_idx])
                ).item()
        
        # Generate explanations
        simple_explanation = generate_simple_explanation(liquor_name, ingredient_name, score)
        gpt_explanation = None
        
        if os.getenv("OPENAI_API_KEY"):
            gpt_explanation = await generate_gpt_explanation(liquor_name, ingredient_name, score)
        
        return ExplanationResponse(
            explanation=simple_explanation,
            gpt_explanation=gpt_explanation
        )
    
    except Exception as e:
        print(f"Error in explanation generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=PairingResponse)
async def predict_pairing(request: PairingRequest):
    """기존 방식 (점수 + 설명 한번에)"""
    try:
        # Check if IDs exist
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        if request.ingredient_id not in iid_to_idx:
            raise HTTPException(status_code=404, detail=f"Ingredient ID {request.ingredient_id} not found")
        
        # Map IDs to indices
        liquor_idx = lid_to_idx[request.liquor_id]
        ingredient_idx = iid_to_idx[request.ingredient_id]
        
        # Get prediction
        with torch.no_grad():
            score = model(
                torch.tensor([liquor_idx]), 
                torch.tensor([ingredient_idx])
            ).item()
        
        # Get names
        liquor_name = liquor_names.get(request.liquor_id, f"Liquor {request.liquor_id}")
        ingredient_name = ingredient_names.get(request.ingredient_id, f"Ingredient {request.ingredient_id}")
        
        # Generate explanations
        simple_explanation = generate_simple_explanation(liquor_name, ingredient_name, score)
        gpt_explanation = None
        
        if request.use_gpt and os.getenv("OPENAI_API_KEY"):
            gpt_explanation = await generate_gpt_explanation(liquor_name, ingredient_name, score)
        
        return PairingResponse(
            score=score, 
            explanation=simple_explanation,
            gpt_explanation=gpt_explanation
        )
    
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_ingredients(request: RecommendationRequest):
    try:
        # Check if liquor ID exists
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        
        # Map liquor ID to index
        liquor_idx = lid_to_idx[request.liquor_id]
        
        # Get all ingredient indices
        ingredient_indices = list(idx_to_iid.keys())
        
        # Create tensors for batch prediction
        liquor_tensor = torch.tensor([liquor_idx] * len(ingredient_indices))
        ingredient_tensor = torch.tensor(ingredient_indices)
        
        # Get all predictions
        with torch.no_grad():
            scores = model(
                liquor_tensor, 
                ingredient_tensor
            ).numpy()
        
        # Get top N ingredients - 최대 3개로 제한
        top_limit = min(request.limit, 3)  # 요청된 개수와 3 중 작은 값 사용
        top_indices = np.argsort(scores)[-top_limit:][::-1]
        
        # Prepare response
        recommendations = []
        for idx in top_indices:
            ingredient_idx = ingredient_indices[idx]
            ingredient_id = idx_to_iid[ingredient_idx]
            ingredient_name = ingredient_names.get(ingredient_id, f"Ingredient {ingredient_id}")
            
            # 개별 설명은 생성하지 않음 (토큰 절약)
            recommendations.append(
                RecommendationItem(
                    ingredient_id=ingredient_id,
                    ingredient_name=ingredient_name,
                    score=float(scores[idx]),
                    explanation=None  # 개별 설명 제거
                )
            )
        
        liquor_name = liquor_names.get(request.liquor_id, f"Liquor {request.liquor_id}")
        
        # Generate overall explanation only
        overall_explanation = None
        if request.use_gpt and os.getenv("OPENAI_API_KEY"):
            overall_explanation = await generate_recommendation_explanation(liquor_name, recommendations)
        
        return RecommendationResponse(
            liquor_id=request.liquor_id,
            liquor_name=liquor_name,
            recommendations=recommendations,
            overall_explanation=overall_explanation
        )
    
    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/liquors", response_model=List[Dict[str, Any]])
async def get_liquors():
    try:
        return [
            {"id": lid, "name": liquor_names.get(lid, f"Liquor {lid}")}
            for lid in lid_to_idx.keys()
        ]
    except Exception as e:
        print(f"Error fetching liquors: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ingredients", response_model=List[Dict[str, Any]])
async def get_ingredients():
    try:
        return [
            {"id": iid, "name": ingredient_names.get(iid, f"Ingredient {iid}")}
            for iid in iid_to_idx.keys()
        ]
    except Exception as e:
        print(f"Error fetching ingredients: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
