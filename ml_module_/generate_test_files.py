# generate_test_data.py
import pandas as pd
import numpy as np
import os

os.makedirs("data", exist_ok=True)

# ========== 1) lot_test.parquet ==========
n_lot = 150  # number of samples
lot_test = pd.DataFrame({
    'lot_id': np.random.choice(['A','B','C','D'], n_lot),
    'weather': np.random.choice(['sunny','rainy','cloudy','foggy'], n_lot),
    'hour_of_day': np.random.randint(0, 24, n_lot),
    'day_of_week': np.random.randint(0, 7, n_lot),
    'temperature': np.random.uniform(10, 42, n_lot),
    'traffic_inflow_rate_zone': np.random.uniform(5, 50, n_lot),
    'available_slots_count': np.random.randint(0, 300, n_lot),
    'historical_arrival_rate_last_15m': np.random.uniform(0, 20, n_lot),
    'historical_arrival_rate_last_1h': np.random.uniform(0, 50, n_lot),
    'num_arrivals_next_30m': np.random.randint(0, 60, n_lot)  # target
})
lot_test.to_parquet("data/lot_test.parquet", index=False)
print("✅ Saved data/lot_test.parquet")

# ========== 2) slot_test.parquet ==========
n_slot = 200
slot_test = pd.DataFrame({
    'lot_id': np.random.choice(['A','B','C','D'], n_slot),
    'slot_size': np.random.choice(['small','medium','large'], n_slot),
    'floor_level': np.random.randint(0, 5, n_slot),
    'is_ev': np.random.randint(0, 2, n_slot),
    'charge_point': np.random.randint(0, 2, n_slot),
    'hour_of_day': np.random.randint(0, 24, n_slot),
    'day_of_week': np.random.randint(0, 7, n_slot),
    'weather': np.random.choice(['sunny','rainy','cloudy','foggy'], n_slot),
    'traffic_inflow_rate_zone': np.random.uniform(5, 50, n_slot),
    'historical_occupancy_rate_last_60m': np.random.uniform(0, 1, n_slot),
    'slot_future_occupied': np.random.randint(0, 2, n_slot)  # binary target
})
slot_test.to_parquet("data/slot_test.parquet", index=False)
print("✅ Saved data/slot_test.parquet")

# ========== 3) slot_meta.parquet ==========
# For neighbor index visualization
n_meta = 100
slot_meta = pd.DataFrame({
    'slot_id': [f"S{i:03}" for i in range(n_meta)],
    'lot_id': np.random.choice(['A','B','C','D'], n_meta),
    'x_coord': np.random.uniform(0, 100, n_meta),
    'y_coord': np.random.uniform(0, 100, n_meta),
    'slot_size': np.random.choice(['small','medium','large'], n_meta),
    'is_ev': np.random.randint(0, 2, n_meta),
    'charge_point': np.random.randint(0, 2, n_meta),
})
slot_meta.to_parquet("data/slot_meta.parquet", index=False)
print("✅ Saved data/slot_meta.parquet")

print("\n🎉 Synthetic test data generated successfully in the 'data/' folder.")
