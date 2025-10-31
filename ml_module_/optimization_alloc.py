# optimization_alloc.py
import pandas as pd
import numpy as np
import joblib
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, LpBinary
import os

os.environ['TMPDIR'] = r"C:\temp_pulp"

# Load models and slot index
rf = joblib.load("models/rf_demand.joblib")
ohe = joblib.load("models/ohe_lot.joblib")
lr = joblib.load("models/lr_slot_occ.joblib")
ohe_s = joblib.load("models/ohe_slot.joblib")
slot_meta = pd.read_parquet("models/slot_index.parquet")

def predict_demand_for_lot(lot_row):
    # lot_row must be dict with same keys used earlier
    Xc = ohe.transform([[lot_row['lot_id'], lot_row['weather']]])
    Xn = np.array([lot_row['hour_of_day'], lot_row['day_of_week'], lot_row['temperature'], lot_row['traffic_inflow_rate_zone'], lot_row['available_slots_count'], lot_row['historical_arrival_rate_last_15m'], lot_row['historical_arrival_rate_last_1h']]).reshape(1,-1)
    X = np.hstack([Xc, Xn])
    return max(0, rf.predict(X)[0])

def predict_slot_occupancy_prob(slot_snapshot):
    # slot_snapshot dict; map to ohe_s
    cat = [slot_snapshot['lot_id'], slot_snapshot['slot_size'], slot_snapshot['hour_of_day'], slot_snapshot['day_of_week'], slot_snapshot['weather']]
    cat_enc = ohe_s.transform([cat])
    num = [slot_snapshot['floor_level'], slot_snapshot['is_ev'], slot_snapshot['charge_point'], slot_snapshot['traffic_inflow_rate_zone'], slot_snapshot.get('historical_occupancy_rate_last_60m',0)]
    X = np.hstack([cat_enc, np.array(num).reshape(1,-1)])
    prob = lr.predict_proba(X)[0][1]
    return prob


import pulp
import os
def allocate_for_incoming(n_new, lot_id, max_distance_weight=1.0):
    # naive: allocate nearest free slots with probability of being free (1 - prob_occupied)
    # here distance = Euclidean to a hypothetical destination (0,0). We'll use slot_meta x,y as distance
    # Build LP: variables x_i in {0,1} allocate slot i
    slots = slot_meta[slot_meta['lot_id']==lot_id].reset_index(drop=True)
    probs = []
    distances = []
    for i,row in slots.iterrows():
        snapshot = {
            "lot_id": row['lot_id'],
            "slot_size": row['slot_size'],
            "hour_of_day": 12,
            "day_of_week": 1,
            "weather": "clear",
            "floor_level": row['floor_level'],
            "is_ev": int(row['is_ev']),
            "charge_point": int(row['charge_point']),
            "traffic_inflow_rate_zone": 1.0,
            "historical_occupancy_rate_last_60m": 0.5
        }
        prob_occ = predict_slot_occupancy_prob(snapshot)
        probs.append(prob_occ)
        # distance to entrance (arbitrary origin)
        distances.append(np.sqrt(row['x_coord']**2 + row['y_coord']**2))
    # LP
    prob_lp = LpProblem("alloc", LpMinimize)
    x_vars = [LpVariable(f"x_{i}", cat='Binary') for i in range(len(slots))]
    # minimize sum distance * x_i / (1 - prob_occ) to favor likely-free and near slots
    prob_lp += lpSum([ distances[i] * x_vars[i] / max(1e-3, (1 - probs[i])) for i in range(len(slots)) ])
    # constraint: allocate exactly n_new
    prob_lp += lpSum(x_vars) == n_new
    # Create solver with proper quoting for path
    solver = pulp.PULP_CBC_CMD(
        path=r'"C:\Anaconda\envs\smart_parking\Lib\site-packages\pulp\solverdir\cbc\win\i64\cbc.exe"',
        msg=True
    )
    prob_lp.solve(solver)

    allocation = []
    for i,v in enumerate(x_vars):
        if v.varValue == 1:
            allocation.append(slots.iloc[i].slot_id)
    return allocation

if __name__ == "__main__":
    print("Allocate 3 slots in lot_1:", allocate_for_incoming(3, "lot_1"))
