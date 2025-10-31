# data_prep_and_simulate.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

np.random.seed(42)

def simulate_events(start_dt, minutes=24*60, lots=3, slots_per_lot=50):
    """
    Simulate event snapshots every minute for `minutes` minutes.
    Returns event-level DataFrame.
    """
    rows = []
    slot_meta = []
    for lot in range(1, lots+1):
        for slot in range(1, slots_per_lot+1):
            slot_meta.append({
                "lot_id": f"lot_{lot}",
                "slot_id": f"lot{lot}_slot{slot}",
                "x_coord": np.random.uniform(0,100),
                "y_coord": np.random.uniform(0,100),
                "floor_level": np.random.choice([0,1,2]),
                "slot_size": np.random.choice(["small","medium","large"], p=[0.2,0.6,0.2]),
                "is_ev": int(np.random.rand() < 0.1),
                "charge_point": int(np.random.rand() < 0.08)
            })

    slot_meta_df = pd.DataFrame(slot_meta)

    current = start_dt
    for minute in range(minutes):
        for lot in range(1, lots+1):
            total_slots = slots_per_lot
            # occupancy percent random walk
            base = 0.6 + 0.15 * np.sin(2*np.pi*(current.hour/24))  # day pattern
            occupancy = np.clip(base + np.random.normal(0,0.08), 0, 1)
            available_slots = int(total_slots * (1 - occupancy))
            arrivals = np.random.poisson(3 + 5*occupancy)  # pseudo
            # traffic_inflow_rate is correlated with arrivals
            traffic_inflow_rate_zone = arrivals/5.0 + np.random.rand()*0.5
            for s in range(total_slots):
                slot_id = f"lot{lot}_slot{s+1}"
                # pick slot meta attributes
                meta = slot_meta_df[(slot_meta_df.lot_id==f"lot_{lot}") & (slot_meta_df.slot_id==slot_id)].iloc[0]
                # occupancy snapshot: random based on occupancy
                slot_occupied = int(np.random.rand() < occupancy)
                rows.append({
                    "timestamp": current,
                    "lot_id": f"lot_{lot}",
                    "slot_id": slot_id,
                    "slot_occupied": slot_occupied,
                    "hour_of_day": current.hour,
                    "day_of_week": current.weekday(),
                    "weather": np.random.choice(["clear","rain"], p=[0.85,0.15]),
                    "temperature": 20 + 5*np.sin(2*np.pi*(current.hour/24)) + np.random.normal(0,1.0),
                    "traffic_inflow_rate_zone": traffic_inflow_rate_zone,
                    "available_slots_count": available_slots,
                    "sensor_signal_strength": np.random.uniform(0.8,1.0),
                    "camera_visibility": int(np.random.rand() > 0.1),
                    "floor_level": int(meta.floor_level),
                    "slot_size": meta.slot_size,
                    "is_ev": int(meta.is_ev),
                    "charge_point": int(meta.charge_point),
                })
        current += timedelta(minutes=1)
    df = pd.DataFrame(rows)
    return df, slot_meta_df

def add_rolling_features(df):
    df = df.sort_values("timestamp")
    # example: per-lot rolling arrival rate (we simulate arrival by changes in occupancy)
    df["occupied_int"] = df.slot_occupied.astype(int)
    # compute per lot rolling occupancy mean for last 60 minutes
    df["historical_occupancy_rate_last_60m"] = df.groupby("lot_id")["occupied_int"].transform(lambda x: x.rolling(60, min_periods=1).mean())
    # rolling arrival rate: difference in occupancy between 2 snapshots (approx)
    df["arrival_approx"] = df.groupby(["lot_id", "timestamp"])["occupied_int"].transform('sum')  # placeholder
    # For simplicity, add historical arrival rate last 15m & 1h using occupancy changes aggregated per minute
    df["historical_arrival_rate_last_15m"] = df.groupby("lot_id")["occupied_int"].transform(lambda x: x.rolling(15, min_periods=1).mean())
    df["historical_arrival_rate_last_1h"] = df.groupby("lot_id")["occupied_int"].transform(lambda x: x.rolling(60, min_periods=1).mean())
    return df

if __name__ == "__main__":
    start = datetime.now().replace(minute=0, second=0, microsecond=0) - timedelta(days=3)
    df, slot_meta = simulate_events(start, minutes=24*60*2, lots=2, slots_per_lot=30)  # 2 days, small dataset
    df = add_rolling_features(df)
    os.makedirs("data", exist_ok=True)
    df.to_parquet("data/simulated_parking_snapshots.parquet", index=False)
    slot_meta.to_parquet("data/slot_meta.parquet", index=False)
    print("Saved simulated data in data/ folder")
