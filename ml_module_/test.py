# # test_models.py
# import pandas as pd
# import numpy as np
# import joblib
# import os
# import matplotlib.pyplot as plt
# import seaborn as sns
# from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score

# # Ensure models exist
# assert os.path.exists("models/rf_demand.joblib"), "Run train_models.py first."

# # =============== 1. DEMAND MODEL TEST ===============
# print("\n--- DEMAND MODEL TEST ---")

# # Load model and encoder
# rf = joblib.load("models/rf_demand.joblib")
# ohe_lot = joblib.load("models/ohe_lot.joblib")

# # Load sample test data (replace with real data if available)
# lot_test = pd.read_parquet("data/lot_test.parquet") if os.path.exists("data/lot_test.parquet") else None

# if lot_test is None:
#     print("⚠️ No 'lot_test.parquet' found. Generating random sample test data...")
#     lot_test = pd.DataFrame({
#         'lot_id': np.random.choice(['A','B','C'], 30),
#         'weather': np.random.choice(['sunny','rainy','cloudy'], 30),
#         'hour_of_day': np.random.randint(0,24,30),
#         'day_of_week': np.random.randint(0,7,30),
#         'temperature': np.random.uniform(10,40,30),
#         'traffic_inflow_rate_zone': np.random.uniform(5,30,30),
#         'available_slots_count': np.random.randint(0,200,30),
#         'historical_arrival_rate_last_15m': np.random.uniform(0,20,30),
#         'historical_arrival_rate_last_1h': np.random.uniform(0,50,30),
#         'num_arrivals_next_30m': np.random.randint(0,50,30)  # target for evaluation
#     })

# cat_cols = ['lot_id','weather']
# num_cols = ['hour_of_day','day_of_week','temperature','traffic_inflow_rate_zone','available_slots_count','historical_arrival_rate_last_15m','historical_arrival_rate_last_1h']
# X_cat_enc = ohe_lot.transform(lot_test[cat_cols].astype(str))
# X_num = lot_test[num_cols].values
# X = np.hstack([X_cat_enc, X_num])

# y_true = lot_test['num_arrivals_next_30m']
# y_pred = rf.predict(X)

# print(f"MAE: {mean_absolute_error(y_true, y_pred):.2f}")
# print(f"RMSE: {np.sqrt(mean_squared_error(y_true, y_pred)):.2f}")

# # --- Visualization ---
# plt.figure(figsize=(7,5))
# sns.scatterplot(x=y_true, y=y_pred)
# plt.plot([y_true.min(), y_true.max()], [y_true.min(), y_true.max()], 'r--')
# plt.title("Random Forest Demand Prediction")
# plt.xlabel("Actual arrivals (next 30m)")
# plt.ylabel("Predicted arrivals")
# plt.tight_layout()
# plt.show()

# # =============== 2. SLOT OCCUPANCY MODEL TEST ===============
# print("\n--- SLOT OCCUPANCY MODEL TEST ---")

# lr = joblib.load("models/lr_slot_occ.joblib")
# ohe_s = joblib.load("models/ohe_slot.joblib")

# slot_test = pd.read_parquet("data/slot_test.parquet") if os.path.exists("data/slot_test.parquet") else None

# if slot_test is None:
#     print("⚠️ No 'slot_test.parquet' found. Generating random sample test data...")
#     slot_test = pd.DataFrame({
#         'lot_id': np.random.choice(['A','B','C'], 30),
#         'slot_size': np.random.choice(['small','medium','large'], 30),
#         'floor_level': np.random.randint(0,5,30),
#         'is_ev': np.random.randint(0,2,30),
#         'charge_point': np.random.randint(0,2,30),
#         'hour_of_day': np.random.randint(0,24,30),
#         'day_of_week': np.random.randint(0,7,30),
#         'weather': np.random.choice(['sunny','rainy','cloudy'], 30),
#         'traffic_inflow_rate_zone': np.random.uniform(5,30,30),
#         'historical_occupancy_rate_last_60m': np.random.uniform(0,1,30),
#         'slot_future_occupied': np.random.randint(0,2,30)
#     })

# cat_s = ['lot_id','slot_size','hour_of_day','day_of_week','weather']
# num_s = ['floor_level','is_ev','charge_point','traffic_inflow_rate_zone','historical_occupancy_rate_last_60m']

# X_s_cat_enc = ohe_s.transform(slot_test[cat_s].astype(str))
# X_s_num = slot_test[num_s].values
# X_s = np.hstack([X_s_cat_enc, X_s_num])
# y_s_true = slot_test['slot_future_occupied']
# y_s_pred = lr.predict(X_s)

# acc = accuracy_score(y_s_true, y_s_pred)
# prec = precision_score(y_s_true, y_s_pred, zero_division=0)
# rec = recall_score(y_s_true, y_s_pred, zero_division=0)
# f1 = f1_score(y_s_true, y_s_pred, zero_division=0)
# print(f"Accuracy: {acc:.2f}, Precision: {prec:.2f}, Recall: {rec:.2f}, F1: {f1:.2f}")

# # --- Visualization ---
# plt.figure(figsize=(6,4))
# sns.heatmap(pd.crosstab(y_s_true, y_s_pred), annot=True, fmt='d', cmap='Blues')
# plt.xlabel("Predicted")
# plt.ylabel("Actual")
# plt.title("Slot Occupancy Confusion Matrix")
# plt.tight_layout()
# plt.show()

# # =============== 3. KNN SLOT NEIGHBOR MODEL TEST ===============
# print("\n--- SLOT NEIGHBOR MODEL TEST ---")

# nn = joblib.load("models/nn_slot_index.joblib")
# slot_meta = pd.read_parquet("models/slot_index.parquet")

# # Pick a random slot and find 5 nearest
# random_slot = slot_meta.sample(1, random_state=42)
# query_point = random_slot[['x_coord','y_coord']].values
# distances, indices = nn.kneighbors(query_point, n_neighbors=5)

# neighbors = slot_meta.iloc[indices[0]]
# print("Random query slot:\n", random_slot)
# print("\nNearest 5 slots:\n", neighbors[['x_coord','y_coord']])

# # --- Visualization ---
# plt.figure(figsize=(6,6))
# plt.scatter(slot_meta['x_coord'], slot_meta['y_coord'], label='All slots', alpha=0.3)
# plt.scatter(neighbors['x_coord'], neighbors['y_coord'], color='orange', label='Nearest slots', s=80)
# plt.scatter(random_slot['x_coord'], random_slot['y_coord'], color='red', label='Query slot', s=100)
# plt.legend()
# plt.xlabel("X coord")
# plt.ylabel("Y coord")
# plt.title("Nearest Slot Visualization")
# plt.tight_layout()
# plt.show()

# print("\n✅ Testing complete for all three models.")


# test_models.py
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score

# Load trained models
rf = joblib.load("models/rf_demand.joblib")
ohe_lot = joblib.load("models/ohe_lot.joblib")

lr = joblib.load("models/lr_slot_occ.joblib")
ohe_slot = joblib.load("models/ohe_slot.joblib")

nn = joblib.load("models/nn_slot_index.joblib")
slot_meta = pd.read_parquet("models/slot_index.parquet")

# ========== DEMAND MODEL TEST ==========
print("\n--- DEMAND MODEL TEST ---")
lot_test = pd.read_parquet("data/lot_test.parquet")

cat_cols = ['lot_id','weather']
num_cols = ['hour_of_day','day_of_week','temperature','traffic_inflow_rate_zone',
            'available_slots_count','historical_arrival_rate_last_15m','historical_arrival_rate_last_1h']

X_cat = lot_test[cat_cols].astype(str)
X_num = lot_test[num_cols].fillna(0).values
X_enc = ohe_lot.transform(X_cat)
X = np.hstack([X_enc, X_num])
y_true = lot_test['num_arrivals_next_30m']

y_pred = rf.predict(X)
mae = mean_absolute_error(y_true, y_pred)
rmse = np.sqrt(mean_squared_error(y_true, y_pred))
print(f"MAE: {mae:.2f}")
print(f"RMSE: {rmse:.2f}")

# Visualization
plt.figure(figsize=(8,5))
plt.scatter(y_true, y_pred, alpha=0.6)
plt.xlabel("Actual Arrivals (Next 30 min)")
plt.ylabel("Predicted Arrivals")
plt.title("Demand Model Predictions vs Actuals")
plt.grid(True)
plt.show()


# ========== SLOT OCCUPANCY MODEL TEST ==========
print("\n--- SLOT OCCUPANCY MODEL TEST ---")
slot_test = pd.read_parquet("data/slot_test.parquet")

cat_s = ['lot_id','slot_size','hour_of_day','day_of_week','weather']
num_s = ['floor_level','is_ev','charge_point','traffic_inflow_rate_zone','historical_occupancy_rate_last_60m']

X_s_cat = slot_test[cat_s].astype(str)
X_s_num = slot_test[num_s].fillna(0).values
X_s_enc = ohe_slot.transform(X_s_cat)
X_s = np.hstack([X_s_enc, X_s_num])
y_s_true = slot_test['slot_future_occupied']

y_s_pred = lr.predict(X_s)
acc = accuracy_score(y_s_true, y_s_pred)
prec = precision_score(y_s_true, y_s_pred, zero_division=0)
rec = recall_score(y_s_true, y_s_pred, zero_division=0)
f1 = f1_score(y_s_true, y_s_pred, zero_division=0)

print(f"Accuracy: {acc:.3f}")
print(f"Precision: {prec:.3f}")
print(f"Recall: {rec:.3f}")
print(f"F1 Score: {f1:.3f}")

# Visualization
plt.figure(figsize=(6,4))
plt.bar(['Accuracy','Precision','Recall','F1'], [acc,prec,rec,f1], color='teal')
plt.title("Slot Occupancy Model Performance")
plt.ylim(0,1)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.show()


# ========== NEAREST NEIGHBOR TEST ==========
print("\n--- NEAREST NEIGHBOR MODEL TEST ---")
# Load metadata again
slot_meta = pd.read_parquet("data/slot_meta.parquet")
coords = slot_meta[['x_coord','y_coord']].values

# Pick a random slot and find 5 nearest ones
idx = np.random.randint(0, len(coords))
distances, indices = nn.kneighbors([coords[idx]], n_neighbors=5)
print(f"Reference slot: {slot_meta.iloc[idx].slot_id}")
print("Nearest slots:")
for j, i in enumerate(indices[0][1:], start=1):
    s = slot_meta.iloc[i]
    print(f"  {j}. {s.slot_id} (Lot {s.lot_id}, EV={s.is_ev}, Coord=({s.x_coord:.1f},{s.y_coord:.1f}))")

# Visualization
plt.figure(figsize=(6,6))
plt.scatter(slot_meta['x_coord'], slot_meta['y_coord'], c='gray', alpha=0.6)
plt.scatter(coords[idx,0], coords[idx,1], c='red', label='Reference Slot', s=100)
plt.scatter(coords[indices[0][1:],0], coords[indices[0][1:],1], c='green', label='Nearest Slots', s=80)
plt.legend()
plt.xlabel("X Coordinate")
plt.ylabel("Y Coordinate")
plt.title("Slot Neighbor Visualization")
plt.grid(True)
plt.show()

print("\n✅ All models tested successfully.")
