"""Lightweight evaluation script for the trained pipelines.

Loads `models/pipeline_demand.joblib` and `models/pipeline_slot.joblib`,
evaluates them on the holdout (last 20%) portion of the prepared
`data/lot_train.parquet` and `data/slot_train.parquet`, and prints metrics.
Also performs a nearest-neighbor sanity check if the index is available.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score


def evaluate_demand():
    p_path = "models/pipeline_demand.joblib"
    if not os.path.exists(p_path):
        print(f"Demand pipeline not found at {p_path}; run train_models.py first.")
        return
    pipe = joblib.load(p_path)
    df = pd.read_parquet("data/lot_train.parquet")
    df = df[~df['num_arrivals_next_30m'].isna()].copy()
    cat_cols = ['lot_id', 'weather']
    num_cols = ['hour_of_day', 'day_of_week', 'temperature', 'traffic_inflow_rate_zone', 'available_slots_count',
                'historical_arrival_rate_last_15m', 'historical_arrival_rate_last_1h']
    X = df[cat_cols + num_cols].copy()
    y = df['num_arrivals_next_30m'].astype(float).values
    split_idx = int(len(X) * 0.8)
    X_test = X.iloc[split_idx:].copy()
    y_test = y[split_idx:]
    y_pred = pipe.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print("\n--- DEMAND MODEL EVALUATION ---")
    print(f"Samples: {len(y_test)}")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"Mean target: {y_test.mean():.4f}")


def evaluate_slot():
    p_path = "models/pipeline_slot.joblib"
    if not os.path.exists(p_path):
        print(f"Slot pipeline not found at {p_path}; run train_models.py first.")
        return
    pipe = joblib.load(p_path)
    df = pd.read_parquet("data/slot_train.parquet")
    df = df.dropna(subset=['slot_future_occupied']).copy()
    cat_s = ['lot_id', 'slot_size', 'hour_of_day', 'day_of_week', 'weather']
    num_s = ['floor_level', 'is_ev', 'charge_point', 'traffic_inflow_rate_zone', 'historical_occupancy_rate_last_60m']
    X = df[cat_s + num_s].copy()
    y = df['slot_future_occupied'].astype(int).values
    split_idx = int(len(X) * 0.8)
    X_test = X.iloc[split_idx:].copy()
    y_test = y[split_idx:]
    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    print("\n--- SLOT OCCUPANCY MODEL EVALUATION ---")
    print(f"Samples: {len(y_test)}")
    print(f"Accuracy:  {acc:.4f} ({100*acc:.2f}%)")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")


def nn_check():
    nn_path = "models/nn_slot_index.joblib"
    slot_index_path = "models/slot_index.parquet"
    print("\n--- NEAREST NEIGHBOR CHECK ---")
    if os.path.exists(nn_path) and os.path.exists(slot_index_path):
        nn = joblib.load(nn_path)
        slot_meta = pd.read_parquet(slot_index_path)
        idx = np.random.randint(0, len(slot_meta))
        coords = slot_meta.iloc[idx][['x_coord', 'y_coord']].values.reshape(1, -1)
        dists, inds = nn.kneighbors(coords)
        print(f"Test slot: {slot_meta.iloc[idx]['slot_id']} at ({slot_meta.iloc[idx]['x_coord']:.1f},{slot_meta.iloc[idx]['y_coord']:.1f})")
        print("Nearest 5 slots:")
        for i, (di, ind) in enumerate(zip(dists[0][:5], inds[0][:5]), 1):
            s = slot_meta.iloc[ind]
            print(f"  {i}. {s['slot_id']} (lot={s['lot_id']}, dist={di:.2f})")
    else:
        print("Nearest neighbor model or index not found; skipping check.")


if __name__ == '__main__':
    evaluate_demand()
    evaluate_slot()
    nn_check()
 
