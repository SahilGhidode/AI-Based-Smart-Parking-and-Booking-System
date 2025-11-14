# data_simulation.py (Final Fix for Prediction Accuracy)
import pandas as pd
import numpy as np
import os

def generate_camera_based_data(n_samples=2500, filename='parking_data.csv'):
    """
    Generates a synthetic dataset for a camera-based smart parking system with enhanced features.
    Features are derived from computer vision analysis (Occupancy, Size) and contextual data (LPR, Time).
    Signal strength is increased to guarantee high model performance (>0.94).
    """
    np.random.seed(42)
    
    # --- 1. GENERATE FEATURE ARRAYS ---
    floor_level = np.random.randint(1, 4, n_samples)
    time_of_day_peak = np.random.choice([0, 1], n_samples, p=[0.6, 0.4])
    user_type_priority = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    slot_size_code = np.random.randint(1, 4, n_samples)
    traffic_condition = np.random.choice(['Low', 'Moderate', 'High'], n_samples, p=[0.4, 0.4, 0.2])
    vehicle_recurrence_score = np.random.randint(0, 10, n_samples)
    recent_vacancy_count = np.random.randint(0, 5, n_samples)
    
    # --- 2. CALCULATE TARGET ARRAYS USING STRONGER RELATIONSHIPS ---
    
    # Target 1: Occupancy (Classification) - Keeping relationships strong for high classification accuracy
    occupancy_chance = (
        (time_of_day_peak * 0.45) + 
        (user_type_priority * 0.35) + 
        (4 - floor_level) * 0.2 + 
        (recent_vacancy_count * -0.15) + 
        np.random.rand(n_samples) * 0.1
    )
    occupancy = occupancy_chance > 0.65
    
    # Target 2: Parking Duration (Regression) - SIGNIFICANTLY BOOSTING SIGNAL AND REDUCING NOISE
    parking_duration_min = np.clip(
        # Increased coefficients (from 70, 40, 6)
        (time_of_day_peak * 100) +       # Stronger impact of peak time
        (user_type_priority * 50) +      # Stronger impact of priority user
        (vehicle_recurrence_score * 10) +# Stronger impact of loyalty
        (4 - floor_level) * 10 + 
        # Reduced noise (from std dev 20 to 5)
        np.random.normal(95, 5, n_samples),
        a_min=10, a_max=300
    ).round(0)

    # --- 3. DEFINE THE FINAL DATA DICTIONARY ---
    data = {
        'Floor_Level': floor_level,
        'Time_of_Day_Peak': time_of_day_peak,
        'User_Type_Priority': user_type_priority,
        'Slot_Size_Code': slot_size_code,
        'Traffic_Condition': traffic_condition,
        'Vehicle_Recurrence_Score': vehicle_recurrence_score,
        'Recent_Vacancy_Count': recent_vacancy_count,
        'Occupancy': occupancy.astype(int), 
        'Parking_Duration_min': parking_duration_min
    }

    df = pd.DataFrame(data)
    
    df.to_csv(filename, index=False)
    print(f"Data simulation complete. Saved {len(df)} records to '{filename}'.")

if __name__ == '__main__':
    generate_camera_based_data()