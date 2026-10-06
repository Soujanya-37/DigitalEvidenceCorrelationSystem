from __future__ import annotations
from pathlib import Path
import argparse, joblib, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT=Path(__file__).resolve().parents[2]
MODEL_DIR=ROOT/'models'; MODEL_DIR.mkdir(exist_ok=True)
DEFAULT=ROOT.parent/'training'/'alibi_training_template.csv'

def train(csv_path: str):
    df=pd.read_csv(csv_path)
    required=['source_type','in_window','has_location','location_match','has_coordinates','distance_m','label']
    missing=[c for c in required if c not in df.columns]
    if missing: raise ValueError('Missing columns: '+', '.join(missing))
    X=df[required[:-1]].copy(); y=df['label'].astype(int)
    cat=['source_type']; num=['in_window','has_location','location_match','has_coordinates','distance_m']
    pre=ColumnTransformer([('cat',Pipeline([('impute',SimpleImputer(strategy='most_frequent')),('onehot',OneHotEncoder(handle_unknown='ignore'))]),cat),('num',SimpleImputer(strategy='median'),num)])
    model=Pipeline([('preprocess',pre),('classifier',RandomForestClassifier(n_estimators=250,max_depth=8,random_state=42,class_weight='balanced'))])
    model.fit(X,y)
    joblib.dump(model,MODEL_DIR/'alibi_event_model.joblib')
    pred=model.predict(X)
    print('TRAINED_MODEL=',MODEL_DIR/'alibi_event_model.joblib')
    print('TRAIN_ROWS=',len(df)); print('TRAIN_ACCURACY=',round(accuracy_score(y,pred),3))
    print(classification_report(y,pred,zero_division=0))

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('--csv',default=str(DEFAULT)); args=ap.parse_args(); train(args.csv)
