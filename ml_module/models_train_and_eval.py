# models_train_and_eval.py
"""
Train and evaluate models:
 - Classification: LR, RF (clf), KNN  -> slot future occupied
 - Regression: RF reg -> number of arrivals next 30m (lot-level)
Saves metrics and visualizations under outputs/ and models/
"""
import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.neighbors import KNeighborsClassifier

from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                             confusion_matrix, roc_curve, auc, precision_recall_curve,
                             mean_absolute_error, mean_squared_error, r2_score)

sns.set(style="whitegrid")
os.makedirs("outputs", exist_ok=True)
os.makedirs("models", exist_ok=True)

# ---------------------------
# Load training data
# ---------------------------
slot_train = pd.read_parquet("data/slot_train.parquet")
lot_train = pd.read_parquet("data/lot_train.parquet")

# ---------------------------
# Preprocessing
# ---------------------------
# Slot-level classification features
cat_cols = ["weather", "slot_size"]
num_cols = ["temperature", "traffic_inflow_rate_zone", "historical_occupancy_rate_last_60m",
            "camera_confidence", "camera_visibility", "floor_level"]

# add cyclic time features
def add_time_feats(df):
    df = df.copy()
    df["hour_sin"] = np.sin(2 * np.pi * df["hour_of_day"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour_of_day"] / 24)
    df["day_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["day_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    return df

slot_train = add_time_feats(slot_train)
lot_train = add_time_feats(lot_train)

num_cols += ["hour_sin","hour_cos","day_sin","day_cos"]

# define X,y for classification
X_slot = slot_train[cat_cols + num_cols]
y_slot = slot_train["slot_future_occupied"]

# split (use shuffle=False if you want temporal split; paper used simple splits)
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X_slot, y_slot, test_size=0.2, random_state=42, shuffle=True)

preproc_slot = ColumnTransformer(transformers=[
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
])

# Preprocess train and test
X_train_s_p = preproc_slot.fit_transform(X_train_s)
X_test_s_p = preproc_slot.transform(X_test_s)

# ---------------------------
# Logistic Regression
# ---------------------------
lr = LogisticRegression(max_iter=2000, class_weight='balanced')
lr.fit(X_train_s_p, y_train_s)
y_pred_lr = lr.predict(X_test_s_p)
y_prob_lr = lr.predict_proba(X_test_s_p)[:,1]

# metrics
def cls_metrics(y_true, y_pred, y_prob=None):
    m = {}
    m["accuracy"] = accuracy_score(y_true, y_pred)
    m["precision"] = precision_score(y_true, y_pred, zero_division=0)
    m["recall"] = recall_score(y_true, y_pred, zero_division=0)
    m["f1"] = f1_score(y_true, y_pred, zero_division=0)
    if y_prob is not None:
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        m["roc_auc"] = auc(fpr, tpr)
    else:
        m["roc_auc"] = None
    return m

lr_metrics = cls_metrics(y_test_s, y_pred_lr, y_prob_lr)
print("LR metrics:", lr_metrics)
joblib.dump(lr, "models/logistic_regression_slot.pkl")
joblib.dump(preproc_slot, "models/preproc_slot.pkl")

# ---------------------------
# Random Forest (classifier)
# ---------------------------
rf_clf = RandomForestClassifier(n_estimators=300, random_state=42, class_weight='balanced')
rf_clf.fit(X_train_s_p, y_train_s)
y_pred_rf = rf_clf.predict(X_test_s_p)
y_prob_rf = rf_clf.predict_proba(X_test_s_p)[:,1]
rf_metrics = cls_metrics(y_test_s, y_pred_rf, y_prob_rf)
print("RF (clf) metrics:", rf_metrics)
joblib.dump(rf_clf, "models/rf_classifier_slot.pkl")

# ---------------------------
# KNN
# ---------------------------
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train_s_p, y_train_s)
y_pred_knn = knn.predict(X_test_s_p)
# no prob for default KNN in sklearn? it has predict_proba, so:
y_prob_knn = knn.predict_proba(X_test_s_p)[:,1] if hasattr(knn, "predict_proba") else None
knn_metrics = cls_metrics(y_test_s, y_pred_knn, y_prob_knn)
print("KNN metrics:", knn_metrics)
joblib.dump(knn, "models/knn_slot.pkl")

# ---------------------------
# Lot-level Demand Regression (RF)
# ---------------------------
# features used for demand
dem_num = ["temperature","traffic_inflow_rate_zone","historical_arrival_rate_last_15m",
           "historical_arrival_rate_last_1h","historical_occupancy_rate_last_60m","camera_confidence","camera_visibility",
           "hour_sin","hour_cos","day_sin","day_cos"]

lot_train = lot_train.fillna(0)
X_dem = lot_train[dem_num]
y_dem = lot_train["num_arrivals_next_30m"].fillna(0)

X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(X_dem, y_dem, test_size=0.2, random_state=42, shuffle=True)

scaler_dem = StandardScaler()
X_train_d_s = scaler_dem.fit_transform(X_train_d)
X_test_d_s = scaler_dem.transform(X_test_d)

rf_reg = RandomForestRegressor(n_estimators=300, random_state=42)
rf_reg.fit(X_train_d_s, y_train_d)
y_pred_dem = rf_reg.predict(X_test_d_s)

dem_metrics = {
    "MAE": mean_absolute_error(y_test_d, y_pred_dem),
    "RMSE": mean_squared_error(y_test_d, y_pred_dem, squared=False),
    "R2": r2_score(y_test_d, y_pred_dem)
}
print("Demand regression metrics:", dem_metrics)
joblib.dump(rf_reg, "models/rf_regressor_demand.pkl")
joblib.dump(scaler_dem, "models/scaler_dem.pkl")

# ---------------------------
# Save metrics and summary table
# ---------------------------
summary = {
    "model": ["LogisticRegression","RandomForest_classifier","KNN","RandomForest_regressor_demand"],
    "accuracy": [lr_metrics["accuracy"], rf_metrics["accuracy"], knn_metrics["accuracy"], None],
    "precision": [lr_metrics["precision"], rf_metrics["precision"], knn_metrics["precision"], None],
    "recall": [lr_metrics["recall"], rf_metrics["recall"], knn_metrics["recall"], None],
    "f1": [lr_metrics["f1"], rf_metrics["f1"], knn_metrics["f1"], None],
    "roc_auc": [lr_metrics["roc_auc"], rf_metrics["roc_auc"], knn_metrics["roc_auc"], None],
    "MAE": [None,None,None,dem_metrics["MAE"]],
    "RMSE": [None,None,None,dem_metrics["RMSE"]],
    "R2": [None,None,None,dem_metrics["R2"]]
}
metrics_df = pd.DataFrame(summary)
metrics_df.to_csv("outputs/metrics_summary.csv", index=False)
print("Saved outputs/metrics_summary.csv")

# ---------------------------
# Visualizations
# ---------------------------
def plot_confusion(y_true, y_pred, title, fname):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(4,3))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(title)
    plt.xlabel('Predicted'); plt.ylabel('Actual')
    plt.tight_layout()
    plt.savefig(fname)
    plt.close()

plot_confusion(y_test_s, y_pred_lr, "LR Confusion Matrix", "outputs/conf_mat_lr.png")
plot_confusion(y_test_s, y_pred_rf, "RF Confusion Matrix", "outputs/conf_mat_rf.png")
plot_confusion(y_test_s, y_pred_knn, "KNN Confusion Matrix", "outputs/conf_mat_knn.png")

# ROC curves
plt.figure(figsize=(6,4))
fpr_lr, tpr_lr, _ = roc_curve(y_test_s, y_prob_lr)
fpr_rf, tpr_rf, _ = roc_curve(y_test_s, y_prob_rf)
plt.plot(fpr_lr, tpr_lr, label=f'LR (AUC={auc(fpr_lr,tpr_lr):.3f})')
plt.plot(fpr_rf, tpr_rf, label=f'RF (AUC={auc(fpr_rf,tpr_rf):.3f})')
if y_prob_knn is not None:
    fpr_knn, tpr_knn, _ = roc_curve(y_test_s, y_prob_knn)
    plt.plot(fpr_knn, tpr_knn, label=f'KNN (AUC={auc(fpr_knn,tpr_knn):.3f})')
plt.plot([0,1],[0,1],'k--')
plt.xlabel('FPR'); plt.ylabel('TPR'); plt.title('ROC Curves'); plt.legend()
plt.tight_layout(); plt.savefig("outputs/roc_curves.png"); plt.close()

# Precision-Recall (LR)
precision, recall, _ = precision_recall_curve(y_test_s, y_prob_lr)
plt.figure(figsize=(6,4)); plt.plot(recall, precision); plt.xlabel('Recall'); plt.ylabel('Precision'); plt.title('Precision-Recall (LR)'); plt.tight_layout(); plt.savefig("outputs/pr_lr.png"); plt.close()

# Bar chart comparison of accuracy and F1
plt.figure(figsize=(8,5))
accs = [lr_metrics['accuracy'], rf_metrics['accuracy'], knn_metrics['accuracy']]
f1s = [lr_metrics['f1'], rf_metrics['f1'], knn_metrics['f1']]
x = np.arange(len(accs))
width = 0.35
plt.bar(x-width/2, accs, width, label='Accuracy')
plt.bar(x+width/2, f1s, width, label='F1')
plt.xticks(x, ['LR','RF','KNN'])
plt.ylim(0,1)
plt.ylabel('Score'); plt.title('Classification Metrics Comparison'); plt.legend()
plt.tight_layout(); plt.savefig("outputs/class_metrics_cmp.png"); plt.close()

# Demand regression: true vs pred scatter
plt.figure(figsize=(6,4))
plt.scatter(y_test_d, y_pred_dem, alpha=0.3)
mn = min(y_test_d.min(), y_pred_dem.min()); mx = max(y_test_d.max(), y_pred_dem.max())
plt.plot([mn,mx],[mn,mx],'r--')
plt.xlabel('True num_arrivals_next_30m'); plt.ylabel('Predicted'); plt.title('Demand: True vs Pred'); plt.tight_layout(); plt.savefig("outputs/demand_true_vs_pred.png"); plt.close()

print("Saved visualizations in outputs/ folder")
