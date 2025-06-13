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
avg_scores = None

# 🔥 실제 raw score 통계를 저장할 변수들
raw_score_stats = {
    'min': float('inf'),
    'max': float('-inf'),
    'samples': []
}

def get_raw_score_from_model(liquor_idx, ingredient_idx):
    """모델에서 sigmoid 전 raw score 추출"""
    with torch.no_grad():
        # 모델의 forward 과정을 따라하되 sigmoid 전까지만
        device = torch.device('cpu')
        edge_index = model.edge_index.to(device)
        edge_type = model.edge_type.to(device)
        edge_weight = model.edge_weight.to(device) if model.edge_weight is not None else None

        x = model.embedding(torch.arange(model.num_nodes, device=device))
        x = model.wrgcn(x, edge_index, edge_type, edge_weight)
        x = torch.nn.functional.relu(x)
        x = torch.nn.functional.dropout(x, p=0.2, training=False)
        x = model.norm1(x)
        x = model.wrgcn2(x, edge_index, edge_type, edge_weight)

        gmf_user_emb = x[liquor_idx]
        gmf_item_emb = x[ingredient_idx]
        mlp_user_emb = x[liquor_idx]
        mlp_item_emb = x[ingredient_idx]

        gmf_user_emb = torch.nn.functional.normalize(gmf_user_emb, dim=-1)
        gmf_item_emb = torch.nn.functional.normalize(gmf_item_emb, dim=-1)

        gmf_output = gmf_user_emb * gmf_item_emb
        mlp_input = torch.cat([mlp_user_emb, mlp_item_emb], dim=-1)
        mlp_output = model.mlp(mlp_input)

        final_input = torch.cat([gmf_output, mlp_output], dim=-1)
        
        # 🔥 sigmoid 전 raw score
        raw_score = model.output_layer(final_input).squeeze().item()
        
        return raw_score

def normalize_raw_score_to_100(raw_score):
    """
    절대적 기준에 따른 0~100 정규화
    일관된 평가를 위해 고정된 구간 기준 사용
    """
    global raw_score_stats
    
    # 통계 업데이트 (모니터링용)
    raw_score_stats['min'] = min(raw_score_stats['min'], raw_score)
    raw_score_stats['max'] = max(raw_score_stats['max'], raw_score)
    raw_score_stats['samples'].append(raw_score)
    
    # 절대적 평가 기준 적용
    if raw_score >= 2.0:      # 90-100점: 정말 뛰어난 조합
        score = 90 + min(10, (raw_score - 2.0) * 5)
        level = "🌟 최고의 조합"
    elif raw_score >= 0.0:    # 80-89점: 매우 좋은 조합
        score = 80 + (raw_score / 2.0) * 10
        level = "⭐ 뛰어난 조합"
    elif raw_score >= -2.0:   # 70-79점: 좋은 조합
        score = 70 + ((raw_score + 2.0) / 2.0) * 10
        level = "👍 좋은 조합"
    elif raw_score >= -4.0:   # 60-69점: 괜찮은 조합
        score = 60 + ((raw_score + 4.0) / 2.0) * 10
        level = "👌 괜찮은 조합"
    elif raw_score >= -6.0:   # 50-59점: 보통 조합
        score = 50 + ((raw_score + 6.0) / 2.0) * 10
        level = "😐 보통 조합"
    elif raw_score >= -8.0:   # 40-49점: 아쉬운 조합
        score = 40 + ((raw_score + 8.0) / 2.0) * 10
        level = "😕 아쉬운 조합"
    elif raw_score >= -10.0:  # 30-39점: 별로인 조합
        score = 30 + ((raw_score + 10.0) / 2.0) * 10
        level = "😞 별로인 조합"
    else:                     # 0-29점: 추천하지 않음
        score = max(0, 30 + ((raw_score + 10.0) / 2.0) * 30)
        level = "❌ 추천하지 않음"
    
    result = max(0, min(100, round(score)))
    
    print(f"🎯 Raw score: {raw_score:.4f} → {result}점 ({level})")
    
    return result
    """
    실제 관찰된 raw score 범위를 기반으로 0~100 정규화
    동적으로 범위를 업데이트하면서 정규화
    """
    global raw_score_stats
    
    # 통계 업데이트
    raw_score_stats['min'] = min(raw_score_stats['min'], raw_score)
    raw_score_stats['max'] = max(raw_score_stats['max'], raw_score)
    raw_score_stats['samples'].append(raw_score)
    
    # 샘플이 충분히 모이면 더 정확한 범위 사용
    if len(raw_score_stats['samples']) > 100:
        # 극값 제거한 범위 사용 (5%tile ~ 95%tile)
        samples = sorted(raw_score_stats['samples'])
        min_score = samples[int(len(samples) * 0.05)]
        max_score = samples[int(len(samples) * 0.95)]
    else:
        # 초기에는 관찰된 min/max 사용
        min_score = raw_score_stats['min']
        max_score = raw_score_stats['max']
    
    # 범위가 너무 좁으면 기본값 사용
    if max_score - min_score < 1.0:
        min_score = -5.0
        max_score = 5.0
    
    # Min-Max 정규화
    if max_score != min_score:
        normalized = ((raw_score - min_score) / (max_score - min_score)) * 100
    else:
        normalized = 50.0  # 기본값
    
    # 0~100 범위로 클램핑
    result = max(0, min(100, round(normalized)))
    
    print(f"🔍 Raw score: {raw_score:.4f}, Range: [{min_score:.2f}, {max_score:.2f}], Normalized: {result}")
    
    return result

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
    limit: int = 3
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
페어링 점수: {score:.0f}점 (100점 만점)

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
        top_items = recommendations[:3]
        items_text = ", ".join([f"{item.ingredient_name}({item.score:.0f}점)" for item in top_items])
        
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
    explanation = f"{liquor_name}과(와) {ingredient_name}의 페어링 점수는 {score:.0f}점입니다. "
    
    if score > 80:
        explanation += "매우 훌륭한 조합으로, 맛과 향이 완벽하게 조화를 이룹니다."
    elif score > 60:
        explanation += "좋은 페어링으로, 여러 풍미 요소가 잘 어울립니다."
    elif score > 40:
        explanation += "무난한 조합이지만 특별함은 부족합니다."
    else:
        explanation += "이 조합은 그다지 잘 어울리지 않습니다."
    
    return explanation

@app.on_event("startup")
async def startup_event():
    global model, lid_to_idx, iid_to_idx, idx_to_lid, idx_to_iid, edges_indexes, edges_weights, edge_type, liquor_names, ingredient_names, avg_scores
    
    try:
        print("Loading node mappings...")
        mapping = map_graph_nodes()
        lid_to_idx = mapping['liquor']
        iid_to_idx = mapping['ingredient']
        
        # Create reverse mappings
        idx_to_lid = {v: k for k, v in lid_to_idx.items()}
        idx_to_iid = {v: k for k, v in iid_to_idx.items()}

        avg_scores = pd.read_csv("./liquor_scores.csv")
        avg_scores = avg_scores.set_index('node_id')['avg_score'].to_dict()
        
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
    """점수만 계산하는 엔드포인트 - Raw score 기반 정규화"""
    try:
        # Check if IDs exist
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        if request.ingredient_id not in iid_to_idx:
            raise HTTPException(status_code=404, detail=f"Ingredient ID {request.ingredient_id} not found")
        
        # Map IDs to indices
        liquor_idx = lid_to_idx[request.liquor_id]
        ingredient_idx = iid_to_idx[request.ingredient_id]
        
        # 🔥 Raw score 추출 및 정규화
        raw_score = get_raw_score_from_model(liquor_idx, ingredient_idx)
        normalized_score = normalize_raw_score_to_100(raw_score)

        return ScoreOnlyResponse(score=normalized_score)
    
    except Exception as e:
        print(f"Error in score prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explanation-only", response_model=ExplanationResponse)
async def get_explanation_only(request: ExplanationRequest):
    """설명만 생성하는 엔드포인트 - Raw score 기반"""
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
            raw_score = get_raw_score_from_model(liquor_idx, ingredient_idx)
            score = normalize_raw_score_to_100(raw_score)
        
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
    """기존 방식 (점수 + 설명 한번에) - Raw score 기반"""
    try:
        # Check if IDs exist
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        if request.ingredient_id not in iid_to_idx:
            raise HTTPException(status_code=404, detail=f"Ingredient ID {request.ingredient_id} not found")
        
        # Map IDs to indices
        liquor_idx = lid_to_idx[request.liquor_id]
        ingredient_idx = iid_to_idx[request.ingredient_id]
        
        # 🔥 Raw score 추출 및 정규화
        raw_score = get_raw_score_from_model(liquor_idx, ingredient_idx)
        score = normalize_raw_score_to_100(raw_score)
        
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
    """추천 엔드포인트 - Raw score 기반"""
    try:
        # Check if liquor ID exists
        if request.liquor_id not in lid_to_idx:
            raise HTTPException(status_code=404, detail=f"Liquor ID {request.liquor_id} not found")
        
        # Map liquor ID to index
        liquor_idx = lid_to_idx[request.liquor_id]
        
        # Get all ingredient indices
        all_ingredient_indices = list(idx_to_iid.keys())
        
        # 🔥 계산할 재료 개수 제한 (전체를 계산하면 너무 오래 걸림)
        max_ingredients_to_test = min(100, len(all_ingredient_indices))  # 최대 100개만 테스트
        ingredient_indices = all_ingredient_indices[:max_ingredients_to_test]
        
        print(f"🔍 Testing {len(ingredient_indices)} ingredients out of {len(all_ingredient_indices)} total")
        
        # 🔥 각 재료에 대해 raw score 계산
        scores = []
        for ingredient_idx in ingredient_indices:
            raw_score = get_raw_score_from_model(liquor_idx, ingredient_idx)
            normalized_score = normalize_raw_score_to_100(raw_score)
            scores.append(normalized_score)
        
        # Get top N ingredients
        top_limit = min(request.limit, 3)
        top_indices = np.argsort(scores)[-top_limit:][::-1]
        
        # Prepare response
        recommendations = []
        for idx in top_indices:
            ingredient_idx = ingredient_indices[idx]
            ingredient_id = idx_to_iid[ingredient_idx]
            ingredient_name = ingredient_names.get(ingredient_id, f"Ingredient {ingredient_id}")
            
            recommendations.append(
                RecommendationItem(
                    ingredient_id=ingredient_id,
                    ingredient_name=ingredient_name,
                    score=float(scores[idx]),
                    explanation=None
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

@app.get("/raw-score-stats")
async def get_raw_score_stats():
    """Raw score 통계 확인용 엔드포인트"""
    return {
        "min": raw_score_stats['min'],
        "max": raw_score_stats['max'],
        "sample_count": len(raw_score_stats['samples']),
        "latest_samples": raw_score_stats['samples'][-10:] if raw_score_stats['samples'] else []
    }

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