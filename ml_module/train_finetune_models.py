# train_models.py (Updated for Higher Regression Accuracy)
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
import warnings

warnings.filterwarnings('ignore') # Suppress K-Means warnings

def train_and_save_models():
    """
    Loads preprocessed data, trains the smart parking models, and saves them.
    """
    try:
        # Load preprocessed data
        X_train_scaled = joblib.load('X_train_scaled.pkl')
        X_train_unscaled = joblib.load('X_train_unscaled.pkl') 
        y_cls_train = joblib.load('y_cls_train.pkl')
        y_reg_train = joblib.load('y_reg_train.pkl')
    except FileNotFoundError:
        print("Error: Missing preprocessed data files. Run 'features_labels.py' first.")
        return

    print("--- Training Models ---")
    
    # --- Model 1: CLASSIFICATION (Predict Occupancy - Paper Goal: > 50% Acc) ---
    lr_cls_model = LogisticRegression(random_state=42, solver='saga', max_iter=1000, penalty='l1') 
    lr_cls_model.fit(X_train_scaled, y_cls_train)
    joblib.dump(lr_cls_model, 'lr_cls_model.pkl')
    print("1. Logistic Regression (Classification) trained and saved.")

    # --- Model 2: PREDICTION/REGRESSION (Predict Parking Duration - Paper Goal: > 0.9400 Overall Avg) ---
    # SIGNIFICANTLY INCREASED COMPLEXITY for higher performance
    rf_reg_model = RandomForestRegressor(
        n_estimators=300,        # Increased from 200 to 300
        max_depth=15,            # Increased from 12 to 15
        min_samples_split=2,
        random_state=42, 
        n_jobs=-1
    )
    rf_reg_model.fit(X_train_unscaled, y_reg_train) 
    joblib.dump(rf_reg_model, 'rf_reg_model.pkl')
    print("2. Random Forest (Regression) trained and saved.")

    # --- Model 3: CLUSTERING (Parking Slot Segmentation) ---
    kmeans_features = X_train_unscaled[['Floor_Level', 'Slot_Size_Code', 'Vehicle_Recurrence_Score']]
    kmeans_model = KMeans(n_clusters=5, random_state=42, n_init=10)
    kmeans_model.fit(kmeans_features)
    joblib.dump(kmeans_model, 'kmeans_model.pkl')
    print("3. KMeans Clustering model trained and saved.")
    
    print("\nAll models trained and saved successfully.")

if __name__ == '__main__':
    train_and_save_models()