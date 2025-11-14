# features_labels.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

# Define the AUGMENTED features derived from camera/contextual data
FEATURES = [
    'Floor_Level', 
    'Slot_Size_Code', 
    'Time_of_Day_Peak', 
    'Traffic_Condition_Encoded', 
    'User_Type_Priority',
    'Vehicle_Recurrence_Score', # NEW: LPR-derived
    'Recent_Vacancy_Count'     # NEW: Vision/Spatial
]
TARGET_CLS = 'Occupancy'
TARGET_REG = 'Parking_Duration_min'

def preprocess_and_split(filename='parking_data.csv'):
    """
    Loads data, preprocesses it, splits into train/test, and saves necessary components.
    """
    if not os.path.exists(filename):
        raise FileNotFoundError(f"'{filename}' not found. Run 'data_simulation.py' first.")
        
    df = pd.read_csv(filename)

    # Encode categorical features
    le = LabelEncoder()
    df['Traffic_Condition_Encoded'] = le.fit_transform(df['Traffic_Condition'])

    X = df[FEATURES]
    y_cls = df[TARGET_CLS]
    y_reg = df[TARGET_REG]
    
    # Split data (80% train, 20% test)
    X_train, X_test, y_cls_train, y_cls_test, y_reg_train, y_reg_test = train_test_split(
        X, y_cls, y_reg, test_size=0.2, random_state=42
    )

    # Standardize numerical features
    scaler = StandardScaler()
    # Scale only the features that benefit from it (typically not binary or one-hot encoded but we scale all here for Logistic Regression)
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Convert back to DataFrame
    X_train_scaled_df = pd.DataFrame(X_train_scaled, columns=FEATURES, index=X_train.index)
    X_test_scaled_df = pd.DataFrame(X_test_scaled, columns=FEATURES, index=X_test.index)
    
    # Save components
    joblib.dump(scaler, 'scaler.pkl')
    joblib.dump(X_train_scaled_df, 'X_train_scaled.pkl')
    joblib.dump(X_test_scaled_df, 'X_test_scaled.pkl')
    joblib.dump(X_train, 'X_train_unscaled.pkl')
    joblib.dump(X_test, 'X_test_unscaled.pkl')
    joblib.dump(y_cls_train, 'y_cls_train.pkl')
    joblib.dump(y_cls_test, 'y_cls_test.pkl')
    joblib.dump(y_reg_train, 'y_reg_train.pkl')
    joblib.dump(y_reg_test, 'y_reg_test.pkl')

    print("Preprocessing and data splitting complete. Components saved as '*.pkl' files.")

if __name__ == '__main__':
    preprocess_and_split()