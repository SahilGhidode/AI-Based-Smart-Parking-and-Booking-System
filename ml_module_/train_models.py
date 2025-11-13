# train_models.py
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score

try:
    from xgboost import XGBRegressor, XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier

os.makedirs("models", exist_ok=True)


def make_preprocessor(cat_cols, num_cols):
    """Build sklearn preprocessing pipeline."""
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    cat_pipeline = Pipeline([
        ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    pre = ColumnTransformer([
        ("num", num_pipeline, num_cols),
        ("cat", cat_pipeline, cat_cols)
    ], remainder="drop")
    return pre


print("\n========== TRAINING DEMAND MODEL ==========")
lot = pd.read_parquet("data/lot_train.parquet")
lot = lot[~lot['num_arrivals_next_30m'].isna()].copy()

cat_cols = ['lot_id', 'weather']
num_cols = ['hour_of_day', 'day_of_week', 'temperature', 'traffic_inflow_rate_zone', 'available_slots_count',
            'historical_arrival_rate_last_15m', 'historical_arrival_rate_last_1h']

X = lot[cat_cols + num_cols].copy()
y = lot['num_arrivals_next_30m'].astype(float).values

print(f"Demand data: {X.shape} samples")

# Temporal split (preserve order for time series)
split_idx = int(len(X) * 0.8)
X_train, X_test = X.iloc[:split_idx].copy(), X.iloc[split_idx:].copy()
y_train, y_test = y[:split_idx], y[split_idx:]

pre_demand = make_preprocessor(cat_cols, num_cols)

if HAS_XGBOOST:
    base_model = XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42, verbosity=0)
else:
    base_model = GradientBoostingRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42)

pipeline_demand = Pipeline([
    ("pre", pre_demand),
    ("model", base_model)
])

print("Fitting demand model...")
pipeline_demand.fit(X_train, y_train)
y_pred = pipeline_demand.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"\nDemand Model Results:")
print(f"  MAE:  {mae:.4f}")
print(f"  RMSE: {rmse:.4f}")

joblib.dump(pipeline_demand, "models/pipeline_demand.joblib")
print(f"Saved: models/pipeline_demand.joblib")

print("\n========== TRAINING SLOT OCCUPANCY MODEL ==========")
slot = pd.read_parquet("data/slot_train.parquet")
slot = slot.dropna(subset=['slot_future_occupied']).copy()

cat_s = ['lot_id', 'slot_size', 'hour_of_day', 'day_of_week', 'weather']
num_s = ['floor_level', 'is_ev', 'charge_point', 'traffic_inflow_rate_zone', 'historical_occupancy_rate_last_60m']

X_s = slot[cat_s + num_s].copy()
y_s = slot['slot_future_occupied'].astype(int).values

print(f"Slot occupancy data: {X_s.shape} samples")
print(f"  Class distribution: {np.bincount(y_s)}")

# Stratified split to balance classes
X_s_train, X_s_test, y_s_train, y_s_test = train_test_split(
    X_s, y_s, test_size=0.2, random_state=42, stratify=y_s
)

pre_slot = make_preprocessor(cat_s, num_s)

if HAS_XGBOOST:
    base_clf = XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42,
                             scale_pos_weight=max(1, (y_s_train == 0).sum() / max(1, (y_s_train == 1).sum())), verbosity=0)
else:
    base_clf = GradientBoostingClassifier(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42)

pipeline_slot = Pipeline([
    ("pre", pre_slot),
    ("model", base_clf)
])

print("Fitting slot occupancy model...")
pipeline_slot.fit(X_s_train, y_s_train)
y_s_pred = pipeline_slot.predict(X_s_test)

acc = accuracy_score(y_s_test, y_s_pred)
prec = precision_score(y_s_test, y_s_pred, zero_division=0)
rec = recall_score(y_s_test, y_s_pred, zero_division=0)
f1 = f1_score(y_s_test, y_s_pred, zero_division=0)

print(f"\nSlot Occupancy Model Results:")
print(f"  Accuracy:  {acc:.4f}")
print(f"  Precision: {prec:.4f}")
print(f"  Recall:    {rec:.4f}")
print(f"  F1-Score:  {f1:.4f}")

joblib.dump(pipeline_slot, "models/pipeline_slot.joblib")
print(f"Saved: models/pipeline_slot.joblib")

print("\n========== SLOT SUGGESTION (NEAREST NEIGHBORS) ==========")
slot_meta = pd.read_parquet("data/slot_meta.parquet")
coords = slot_meta[['x_coord', 'y_coord']].values
nn = NearestNeighbors(n_neighbors=10, algorithm='auto').fit(coords)
joblib.dump(nn, "models/nn_slot_index.joblib")
slot_meta.to_parquet("models/slot_index.parquet", index=False)
print(f"Saved: models/nn_slot_index.joblib, models/slot_index.parquet")

print("\n========== TRAINING COMPLETE ==========")