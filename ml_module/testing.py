# testing.py
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, mean_squared_error, accuracy_score, precision_recall_fscore_support

# Constants for paper comparison
RF_PAPER_AVG_GOAL = 0.9400
LR_PAPER_CLS_GOAL = 0.50

def calculate_overall_average(y_true, y_pred):
    """
    Calculates the 'Overall Average' metric as defined in the paper's comparison tables, 
    using a classification-like evaluation for regression results.
    """
    # 1. Regression Accuracy (Prediction within a 10% tolerance)
    tolerance = 0.10 * y_true.mean()
    correct_predictions_count = np.sum(np.abs(y_true - y_pred) <= tolerance)
    accuracy_metric = correct_predictions_count / len(y_true)

    # 2. Macro Average of P, R, F1 on binarized predictions
    y_true_bin = (y_true > y_true.median()).astype(int)
    y_pred_bin = (y_pred > y_true.median()).astype(int)
    p, r, f1, _ = precision_recall_fscore_support(y_true_bin, y_pred_bin, average='macro', zero_division=0)
    
    # 3. Overall Average
    overall_avg = (accuracy_metric + p + r + f1) / 4
    
    return accuracy_metric, p, r, f1, overall_avg

def run_testing_script():
    """
    Loads models and test data, and evaluates the performance.
    """
    try:
        # Load Test Data
        X_test_scaled = joblib.load('X_test_scaled.pkl')
        X_test_unscaled = joblib.load('X_test_unscaled.pkl')
        y_cls_test = joblib.load('y_cls_test.pkl')
        y_reg_test = joblib.load('y_reg_test.pkl')
        
        # Load Models
        lr_cls_model = joblib.load('lr_cls_model.pkl')
        rf_reg_model = joblib.load('rf_reg_model.pkl')
        kmeans_model = joblib.load('kmeans_model.pkl')
    except FileNotFoundError:
        print("Error: Missing model or data files. Ensure all previous steps were run successfully.")
        return

    print("--- SMART PARKING SYSTEM TESTING RESULTS ---")
    
    # =======================================================
    # 1. CLASSIFICATION MODEL EVALUATION (Occupancy Prediction)
    # =======================================================
    print("\n1. CLASSIFICATION MODEL EVALUATION (Occupancy Prediction)")
    y_cls_pred = lr_cls_model.predict(X_test_scaled)
    lr_cls_acc = accuracy_score(y_cls_test, y_cls_pred)
    
    print(f"Goal: Beat Paper's 50% Accuracy (LR Classification).")
    print(f"**Achieved Accuracy: {lr_cls_acc:.4f}**")
    print(f"Result: {'GOAL ACHIEVED 🎉' if lr_cls_acc > LR_PAPER_CLS_GOAL else 'GOAL FAILED ❌'}")
    print("\nFull Classification Report:")
    print(classification_report(y_cls_test, y_cls_pred, target_names=['Vacant (0)', 'Occupied (1)']))


    # =======================================================
    # 2. PREDICTION MODEL EVALUATION (Parking Duration)
    # =======================================================
    print("\n2. PREDICTION MODEL EVALUATION (Parking Duration - Random Forest)")
    # Use unscaled test data for the Random Forest model
    y_reg_pred_rf = rf_reg_model.predict(X_test_unscaled)
    rf_mse = mean_squared_error(y_reg_test, y_reg_pred_rf)
    
    rf_acc, rf_p, rf_r, rf_f1, rf_avg = calculate_overall_average(y_reg_test, y_reg_pred_rf)
    
    print(f"Goal: Beat Paper's Random Forest Overall Average of {RF_PAPER_AVG_GOAL}.")
    print(f"**Achieved Overall Average: {rf_avg:.4f}**")
    print(f"Result: {'GOAL ACHIEVED 🎉' if rf_avg > RF_PAPER_AVG_GOAL else 'GOAL FAILED ❌'}")
    print(f"Mean Squared Error (MSE): {rf_mse:.2f}")

    results_table = pd.DataFrame({
        'Metric': ['Accuracy (Tolerated)', 'Precision (Macro)', 'Recall (Macro)', 'F1-Score (Macro)', 'Overall Average'],
        'Value': [rf_acc, rf_p, rf_r, rf_f1, rf_avg],
        'Paper Goal (Overall Avg)': ['-', '-', '-', '-', RF_PAPER_AVG_GOAL]
    })
    
    print("\nComparison Metrics:")
    print(results_table.round(4).to_markdown(index=False))

    
    # =======================================================
    # 3. CLUSTERING MODEL PREDICTION
    # =======================================================
    print("\n3. CLUSTERING MODEL PREDICTION (KMeans)")
    # Predict clusters for the test set
    kmeans_test_features = X_test_unscaled[['Floor_Level', 'Slot_Size_Code', 'Vehicle_Recurrence_Score']]
    test_clusters = kmeans_model.predict(kmeans_test_features)
    
    print(f"KMeans model is trained for 5 clusters (0-4).")
    print(f"Cluster assignment for the first 10 test samples: {test_clusters[:10].tolist()}")
    print("Clustering is used to segment slots based on attributes and historical user behavior for targeted management.")

if __name__ == '__main__':
    run_testing_script()