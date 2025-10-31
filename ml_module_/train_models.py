# train_models.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import TimeSeriesSplit, train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

os.makedirs("models", exist_ok=True)

# 1) Demand model (lot level)
lot = pd.read_parquet("data/lot_train.parquet")
# drop rows with NaN target
lot = lot[~lot['num_arrivals_next_30m'].isna()]
# features:
cat_cols = ['lot_id','weather']
num_cols = ['hour_of_day','day_of_week','temperature','traffic_inflow_rate_zone','available_slots_count','historical_arrival_rate_last_15m','historical_arrival_rate_last_1h']
X_cat = lot[cat_cols].astype(str)
ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_cat_enc = ohe.fit_transform(X_cat)
X_num = lot[num_cols].fillna(0).values
X = np.hstack([X_cat_enc, X_num])
y = lot['num_arrivals_next_30m'].astype(float).values

# time-based split: use first 80% times for training
split_idx = int(len(X)*0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
print("Demand model MAE:", mean_absolute_error(y_test, y_pred))
print("Demand model RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))

joblib.dump(rf, "models/rf_demand.joblib")
joblib.dump(ohe, "models/ohe_lot.joblib")

# 2) Slot occupancy model
slot = pd.read_parquet("data/slot_train.parquet")
# select snapshot features and label
slot = slot.dropna(subset=['slot_future_occupied'])
# features
slot_features = ['lot_id','slot_size','floor_level','is_ev','charge_point','hour_of_day','day_of_week','weather','traffic_inflow_rate_zone','historical_occupancy_rate_last_60m']
cat_s = ['lot_id','slot_size','hour_of_day','day_of_week','weather']
num_s = ['floor_level','is_ev','charge_point','traffic_inflow_rate_zone','historical_occupancy_rate_last_60m']
X_s_cat = slot[cat_s].astype(str)
ohe_s = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_s_cat_enc = ohe_s.fit_transform(X_s_cat)
X_s_num = slot[num_s].fillna(0).values
X_s = np.hstack([X_s_cat_enc, X_s_num])
y_s = slot['slot_future_occupied'].astype(int).values

X_s_train, X_s_test, y_s_train, y_s_test = train_test_split(X_s, y_s, test_size=0.2, random_state=42, shuffle=False)

lr = LogisticRegression(max_iter=1000, class_weight="balanced")
lr.fit(X_s_train, y_s_train)
y_s_pred = lr.predict(X_s_test)
print("Slot occupancy acc:", accuracy_score(y_s_test, y_s_pred))
print("Slot occupancy precision:", precision_score(y_s_test, y_s_pred, zero_division=0))
print("Slot occupancy recall:", recall_score(y_s_test, y_s_pred, zero_division=0))
print("Slot occupancy f1:", f1_score(y_s_test, y_s_pred, zero_division=0))

joblib.dump(lr, "models/lr_slot_occ.joblib")
joblib.dump(ohe_s, "models/ohe_slot.joblib")

# 3) KNN / Nearest neighbors index for slot suggestion
# create slot table with coordinates and meta, dedupe last snapshot
slot_meta = pd.read_parquet("data/slot_meta.parquet")
# For simplicity, index by coordinates
coords = slot_meta[['x_coord','y_coord']].values
nn = NearestNeighbors(n_neighbors=10, algorithm='auto').fit(coords)
joblib.dump(nn, "models/nn_slot_index.joblib")
slot_meta.to_parquet("models/slot_index.parquet", index=False)

print("Saved RF, LR, and NearestNeighbors models in models/ folder")
