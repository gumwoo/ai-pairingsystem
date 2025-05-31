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

class PairingResponse(BaseModel):
    score: float
    explanation: Optional[str] = None

class RecommendationRequest(BaseModel):
    liquor_id: int
    limit: int = 10

class RecommendationItem(BaseModel):
    ingredient_id: int
    ingredient_name: str
    score: float

class RecommendationResponse(BaseModel):
    liquor_id: int
    liquor_name: str
    recommendations: List[RecommendationItem]

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

@app.post("/predict", response_model=PairingResponse)
async def predict_pairing(request: PairingRequest):
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
        
        # Generate explanation (in a real system, this would be more sophisticated)
        liquor_name = liquor_names.get(request.liquor_id, f"Liquor {request.liquor_id}")
        ingredient_name = ingredient_names.get(request.ingredient_id, f"Ingredient {request.ingredient_id}")
        
        explanation = f"{liquor_name} pairs with {ingredient_name} with a compatibility score of {score:.2f}."
        if score > 0.8:
            explanation += " This is an excellent match with highly complementary flavor profiles."
        elif score > 0.6:
            explanation += " This is a good pairing with several compatible flavor notes."
        elif score > 0.4:
            explanation += " This pairing is acceptable but not exceptional."
        else:
            explanation += " These items don't pair particularly well together."
        
        return PairingResponse(score=score, explanation=explanation)
    
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
        
        # Get top N ingredients
        top_indices = np.argsort(scores)[-request.limit:][::-1]
        
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
                    score=float(scores[idx])
                )
            )
        
        liquor_name = liquor_names.get(request.liquor_id, f"Liquor {request.liquor_id}")
        
        return RecommendationResponse(
            liquor_id=request.liquor_id,
            liquor_name=liquor_name,
            recommendations=recommendations
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
