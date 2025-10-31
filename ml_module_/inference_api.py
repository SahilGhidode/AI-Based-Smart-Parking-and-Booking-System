# inference_api.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import uvicorn
import numpy as np
import pandas as pd

app = FastAPI()
rf = joblib.load("models/rf_demand.joblib")
ohe = joblib.load("models/ohe_lot.joblib")
lr = joblib.load("models/lr_slot_occ.joblib")
ohe_s = joblib.load("models/ohe_slot.joblib")
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
    Xc = ohe.transform([[req.lot_id, req.weather]])
    Xn = np.array([req.hour_of_day, req.day_of_week, req.temperature, req.traffic_inflow_rate_zone, req.available_slots_count, req.historical_arrival_rate_last_15m, req.historical_arrival_rate_last_1h]).reshape(1,-1)
    X = np.hstack([Xc, Xn])
    pred = float(rf.predict(X)[0])
    return {"predicted_arrivals_next_30m": max(0, pred)}

@app.post("/slot_occupancy_prob")
def slot_prob(req: SlotProbRequest):
    cat = [req.lot_id, req.slot_size, req.hour_of_day, req.day_of_week, req.weather]
    cat_enc = ohe_s.transform([cat])
    num = [req.floor_level, req.is_ev, req.charge_point, req.traffic_inflow_rate_zone, req.historical_occupancy_rate_last_60m]
    X = np.hstack([cat_enc, np.array(num).reshape(1,-1)])
    prob = float(lr.predict_proba(X)[0][1])
    return {"prob_slot_occupied_next_10m": prob}

@app.get("/nearest_free_slots/{lot_id}/{n}")
def nearest_free_slots(lot_id: str, n: int = 5):
    # naive: return nearest n by euclidean coord
    slots = slot_meta[slot_meta['lot_id']==lot_id].copy()
    slots['dist'] = (slots['x_coord']**2 + slots['y_coord']**2)**0.5
    slots = slots.sort_values('dist').head(n)
    return {"suggested_slots": slots['slot_id'].tolist()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
