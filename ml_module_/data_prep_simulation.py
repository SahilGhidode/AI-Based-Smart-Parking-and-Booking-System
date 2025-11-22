# data_prep_and_simulate.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

np.random.seed(42)

def simulate_events(start_dt, minutes=24*60*7, lots=3, slots_per_lot=50):
    """
    Simulate event snapshots every minute with REALISTIC PARKING PATTERNS.
    Strong daily peaks 8-10am (commute in) and 5-7pm (commute home).
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
                "is_ev": int(np.random.rand() < 0.15),
                "charge_point": int(np.random.rand() < 0.1)
            })

    slot_meta_df = pd.DataFrame(slot_meta)

    current = start_dt
    for minute in range(minutes):
        for lot in range(1, lots+1):
            total_slots = slots_per_lot
            
            # REALISTIC PEAK PATTERNS
            hour_sin = np.sin(2*np.pi*(current.hour/24))
            morning_peak = 1.0 if 8 <= current.hour <= 10 else 0.0
            evening_peak = 1.0 if 17 <= current.hour <= 19 else 0.0
            night_factor = 0.7 if 22 <= current.hour or current.hour <= 6 else 1.0
            
            # Base occupancy driven by peaks
            daily_trend = (0.35 + 0.25*hour_sin + 0.35*morning_peak + 0.40*evening_peak) * night_factor
            weather = "clear" if np.random.rand() < 0.8 else "rain"
            weather_factor = 0.12 if weather == "rain" else 0.0
            occupancy = np.clip(daily_trend - weather_factor + np.random.normal(0,0.025), 0, 1)

            available_slots = int(total_slots * (1 - occupancy))
            
            # STRONG ARRIVAL SIGNALS: peaks during rush hours
            if 8 <= current.hour <= 10:
                arrivals = max(0, int(np.random.poisson(14)))
            elif 17 <= current.hour <= 19:
                arrivals = max(0, int(np.random.poisson(16)))
            elif 12 <= current.hour <= 14:
                arrivals = max(0, int(np.random.poisson(5)))
            elif 20 <= current.hour or current.hour <= 7:
                arrivals = max(0, int(np.random.poisson(1)))
            else:
                arrivals = max(0, int(np.random.poisson(3)))
            
            traffic_inflow_rate_zone = np.clip((arrivals / 15.0) * (1 + 0.2*np.random.randn()), 0, 2.5)
            
            for s in range(total_slots):
                slot_id = f"lot{lot}_slot{s+1}"
                meta = slot_meta_df[(slot_meta_df.lot_id==f"lot_{lot}") & (slot_meta_df.slot_id==slot_id)].iloc[0]
                
                # Occupancy: strong correlation with lot + EV preference during peaks
                slot_occ_prob = occupancy
                if meta.is_ev and (morning_peak > 0.5 or evening_peak > 0.5):
                    slot_occ_prob = np.clip(slot_occ_prob + 0.18, 0, 1)
                
                slot_occupied = int(np.random.rand() < slot_occ_prob)
                rows.append({
                    "timestamp": current,
                    "lot_id": f"lot_{lot}",
                    "slot_id": slot_id,
                    "slot_occupied": slot_occupied,
                    "hour_of_day": current.hour,
                    "day_of_week": current.weekday(),
                    "weather": weather,
                    "temperature": 20 + 5*hour_sin + np.random.normal(0,0.5),
                    "traffic_inflow_rate_zone": traffic_inflow_rate_zone,
                    "available_slots_count": available_slots,
                    "sensor_signal_strength": np.random.uniform(0.93,1.0),
                    "camera_visibility": 1 if np.random.rand() > 0.02 else 0,
                    "floor_level": int(meta.floor_level),
                    "slot_size": meta.slot_size,
                    "is_ev": int(meta.is_ev),
                    "charge_point": int(meta.charge_point),
                })
        current += timedelta(minutes=1)
    df = pd.DataFrame(rows)
    return df, slot_meta_df

def add_rolling_features(df):
    df = df.sort_values(["lot_id", "timestamp"]).copy()
    # occupancy int
    df["occupied_int"] = df.slot_occupied.astype(int)

    # compute per-lot occupied_count per timestamp
    occ = df.groupby(["lot_id", "timestamp"])['occupied_int'].sum().reset_index(name='occupied_count')
    occ = occ.sort_values(['lot_id', 'timestamp'])
    # arrivals approx: positive changes in occupied_count between adjacent timestamps
    occ['occupied_prev'] = occ.groupby('lot_id')['occupied_count'].shift(1).bfill()
    occ['arrivals_approx'] = (occ['occupied_count'] - occ['occupied_prev']).clip(lower=0)

    # rolling aggregates on the arrivals series
    occ['historical_arrival_rate_last_15m'] = occ.groupby('lot_id')['arrivals_approx'].transform(lambda x: x.rolling(15, min_periods=1).mean())
    occ['historical_arrival_rate_last_1h'] = occ.groupby('lot_id')['arrivals_approx'].transform(lambda x: x.rolling(60, min_periods=1).mean())

    # rolling occupancy rate for last 60m (from occupied_count)
    slots_per_lot = df.groupby('lot_id')['slot_id'].nunique().to_dict()
    occ['historical_occupancy_rate_last_60m'] = occ.groupby('lot_id')['occupied_count'].transform(lambda x: x.rolling(60, min_periods=1).mean())
    occ['historical_occupancy_rate_last_60m'] = occ.apply(lambda r: r['historical_occupancy_rate_last_60m'] / slots_per_lot.get(r['lot_id'], 1), axis=1)

    # merge these lot-level features back to slot-level snapshots
    df = df.merge(occ[['lot_id', 'timestamp', 'arrivals_approx', 'historical_arrival_rate_last_15m', 'historical_arrival_rate_last_1h', 'historical_occupancy_rate_last_60m']], on=['lot_id', 'timestamp'], how='left')
    # fill missing
    df['historical_arrival_rate_last_15m'] = df['historical_arrival_rate_last_15m'].fillna(0)
    df['historical_arrival_rate_last_1h'] = df['historical_arrival_rate_last_1h'].fillna(0)
    df['historical_occupancy_rate_last_60m'] = df['historical_occupancy_rate_last_60m'].fillna(0)
    return df

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate simulated parking data")
    parser.add_argument("--minutes", type=int, default=24*60*7, help="number of minutes to simulate (default: 7 days)")
    parser.add_argument("--lots", type=int, default=4, help="number of lots to simulate (default: 4)")
    parser.add_argument("--slots-per-lot", type=int, default=40, help="slots per lot (default: 40)")
    parser.add_argument("--start-days-ago", type=int, default=8, help="how many days ago to start the simulation window")
    args = parser.parse_args()

    start = datetime.now().replace(minute=0, second=0, microsecond=0) - timedelta(days=args.start_days_ago)
    print(f"Starting simulation: minutes={args.minutes}, lots={args.lots}, slots_per_lot={args.slots_per_lot}")
    df, slot_meta = simulate_events(start, minutes=args.minutes, lots=args.lots, slots_per_lot=args.slots_per_lot)
    print("Simulated events, now computing rolling features (this may take a moment)...")
    df = add_rolling_features(df)
    os.makedirs("data", exist_ok=True)
    df.to_parquet("data/simulated_parking_snapshots.parquet", index=False)
    slot_meta.to_parquet("data/slot_meta.parquet", index=False)
    print("Saved simulated data in data/ folder")
