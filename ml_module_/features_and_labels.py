# features_and_labels.py
import pandas as pd
import numpy as np
from datetime import timedelta
import joblib
import os

def create_lot_level_demand(df, window_minutes=30):
    # df must be per-minute snapshots
    df = df.sort_values("timestamp")
    # compute arrivals per minute per lot as difference in occupancy (approx)
    # Here we will approximate arrivals by positive changes in occupied count per lot
    occ = df.groupby(["lot_id","timestamp"])["slot_occupied"].sum().reset_index(name="occupied_count")
    occ = occ.sort_values(["lot_id","timestamp"])
    occ["occupied_prev"] = occ.groupby("lot_id")["occupied_count"].shift(1).fillna(method="bfill")
    occ["arrivals_approx"] = np.clip(occ["occupied_count"] - occ["occupied_prev"], 0, None)
    # aggregate future window
    occ["num_arrivals_next_{}m".format(window_minutes)] = occ.groupby("lot_id")["arrivals_approx"].transform(lambda x: x.rolling(window_minutes, min_periods=1).sum().shift(-window_minutes+1))
    # join back rolling features if needed (we'll merge with other features)
    occ = occ.drop(columns=["occupied_prev"])
    return occ

def generate_slot_labels(df, future_minutes=10):
    # For each slot snapshot, label if slot will be occupied at any point in next future_minutes
    df = df.sort_values(["slot_id", "timestamp"])
    df['slot_future_occupied'] = df.groupby("slot_id")['slot_occupied'].transform(lambda x: x.rolling(future_minutes, min_periods=1).max().shift(-future_minutes+1)).fillna(0).astype(int)
    return df

if __name__ == "__main__":
    df = pd.read_parquet("data/simulated_parking_snapshots.parquet")
    slot_meta = pd.read_parquet("data/slot_meta.parquet")
    occ = create_lot_level_demand(df, window_minutes=30)
    df_slots = generate_slot_labels(df, future_minutes=10)
    # Merge example: pick snapshot features for training
    # For demand training, aggregate features per lot per minute
    lot_features = df.groupby(["lot_id","timestamp"]).agg({
        "hour_of_day":"first",
        "day_of_week":"first",
        "weather":"first",
        "temperature":"mean",
        "traffic_inflow_rate_zone":"mean",
        "available_slots_count":"mean",
        "historical_arrival_rate_last_15m":"mean",
        "historical_arrival_rate_last_1h":"mean"
    }).reset_index()
    lot_train = lot_features.merge(occ[['lot_id','timestamp','num_arrivals_next_30m']], on=['lot_id','timestamp'], how='left').fillna(0)

    lot_train.to_parquet("data/lot_train.parquet", index=False)
    df_slots.to_parquet("data/slot_train.parquet", index=False)
    print("Prepared lot_train.parquet and slot_train.parquet")
