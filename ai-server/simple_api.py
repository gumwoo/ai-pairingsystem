from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import random
import math

app = FastAPI(title="Simple AI Pairing API", version="1.0.0")

class PairingRequest(BaseModel):
    liquor_id: int
    ingredient_id: int

class PairingResponse(BaseModel):
    score: float
    explanation: str = None

@app.get("/")
async def root():
    return {"message": "Simple AI Pairing Server", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PairingResponse)
async def predict_pairing(request: PairingRequest):
    """
    Simple algorithm-based pairing prediction
    """
    try:
        # Simple algorithm for consistent scores
        base_a = request.liquor_id * 0.01
        base_b = request.ingredient_id * 0.01
        
        # Generate score using trigonometric function
        angle = (base_a * 7.5 + base_b * 12.3) % (2 * math.pi)
        raw_score = (math.cos(angle) + 1) / 2  # 0-1 range
        
        # Add some variation based on IDs
        variation = (request.liquor_id + request.ingredient_id) % 100 / 1000
        score = raw_score + variation - 0.05
        
        # Clamp to reasonable range
        score = max(0.1, min(0.95, score))
        
        # Convert to neural network style output (can be negative)
        neural_score = math.log(score / (1 - score))  # logit function
        
        explanation = f"Algorithmic pairing score for liquor {request.liquor_id} and ingredient {request.ingredient_id}"
        
        return PairingResponse(score=neural_score, explanation=explanation)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
