import pandas as pd
from sklearn.preprocessing import LabelEncoder

lot = pd.read_parquet("data/lot_train.parquet")
slot = pd.read_parquet("data/slot_train.parquet")

le = LabelEncoder()
vals = set()
if "weather" in lot.columns:
    vals.update(lot["weather"].dropna().unique().tolist())
if "weather" in slot.columns:
    vals.update(slot["weather"].dropna().unique().tolist())
if not vals:
    vals = {"clear"}
le.fit(sorted(list(vals)))
print("weather classes:", le.classes_)
if "weather" not in lot.columns:
    lot["weather"] = "clear"
else:
    lot["weather"] = lot["weather"].fillna("clear")
lot["weather"] = le.transform(lot["weather"])
print("lot weather transformed ok, sample:", lot["weather"].head().tolist())
if "weather" not in slot.columns:
    slot["weather"] = "clear"
else:
    slot["weather"] = slot["weather"].fillna("clear")
slot["weather"] = le.transform(slot["weather"])
print("slot weather transformed ok, sample:", slot["weather"].head().tolist())
