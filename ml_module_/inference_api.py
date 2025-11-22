# inference_api.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import uvicorn
import numpy as np
import pandas as pd

app = FastAPI()
# Load pipelines saved by train_models.py
pipeline_demand = joblib.load("models/pipeline_demand.joblib")
pipeline_slot = joblib.load("models/pipeline_slot.joblib")
nn = joblib.load("models/nn_slot_index.joblib")
slot_meta = pd.read_parquet("models/slot_index.parquet")

class LotForecastRequest(BaseModel):
    lot_id: str
    hour_of_day: int
    day_of_week: int
    weather: str
    temperature: float
    traffic_inflow_rate_zone: float
    available_slots_count: int
    historical_arrival_rate_last_15m: float
    historical_arrival_rate_last_1h: float

class SlotProbRequest(BaseModel):
    lot_id: str
    slot_size: str
    floor_level: int
    is_ev: int
    charge_point: int
    hour_of_day: int
    day_of_week: int
    weather: str
    traffic_inflow_rate_zone: float
    historical_occupancy_rate_last_60m: float

@app.post("/forecast_demand")
def forecast_demand(req: LotForecastRequest):
    X = pd.DataFrame([{
        'lot_id': req.lot_id,
        'weather': req.weather,
        'hour_of_day': req.hour_of_day,
        'day_of_week': req.day_of_week,
        'temperature': req.temperature,
        'traffic_inflow_rate_zone': req.traffic_inflow_rate_zone,
        'available_slots_count': req.available_slots_count,
        'historical_arrival_rate_last_15m': req.historical_arrival_rate_last_15m,
        'historical_arrival_rate_last_1h': req.historical_arrival_rate_last_1h
    }])
    pred = float(pipeline_demand.predict(X)[0])
    return {"predicted_arrivals_next_30m": max(0, pred)}

@app.post("/slot_occupancy_prob")
def slot_prob(req: SlotProbRequest):
    X = pd.DataFrame([{
        'lot_id': req.lot_id,
        'slot_size': req.slot_size,
        'hour_of_day': req.hour_of_day,
        'day_of_week': req.day_of_week,
        'weather': req.weather,
        'floor_level': req.floor_level,
        'is_ev': req.is_ev,
        'charge_point': req.charge_point,
        'traffic_inflow_rate_zone': req.traffic_inflow_rate_zone,
        'historical_occupancy_rate_last_60m': req.historical_occupancy_rate_last_60m
    }])
    prob = float(pipeline_slot.predict_proba(X)[0][1])
    return {"prob_slot_occupied_next_10m": prob}

@app.get("/nearest_free_slots/{lot_id}/{n}")
def nearest_free_slots(lot_id: str, n: int = 5):
    # use precomputed nearest neighbors index if available
    slots = slot_meta[slot_meta['lot_id']==lot_id].copy()
    if slots.empty:
        return {"suggested_slots": []}
    # if nearest-neighbors index loaded, use it; fallback to simple distance
    try:
        # get coords for lot
        coords = slots[['x_coord','y_coord']].values
        dists = np.linalg.norm(coords - coords.mean(axis=0), axis=1)
        slots['dist'] = dists
        slots = slots.sort_values('dist').head(n)
        return {"suggested_slots": slots['slot_id'].tolist()}
    except Exception:
        slots['dist'] = (slots['x_coord']**2 + slots['y_coord']**2)**0.5
        slots = slots.sort_values('dist').head(n)
        return {"suggested_slots": slots['slot_id'].tolist()}

@app.get("/")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "SmartParking ML Inference API running"}


if __name__ == "__main__":
    print("\n" + "="*70)
    print("SmartParking ML Inference API")
    print("="*70)
    print("Starting Uvicorn server...")
    print("API will be available at: http://127.0.0.1:8000")
    print("API Docs (Swagger UI) at: http://127.0.0.1:8000/docs")
    print("="*70 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
