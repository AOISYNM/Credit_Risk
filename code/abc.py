import xgboost, joblib, os
print(xgboost.__version__)
print(os.path.getsize('credit_risk_model.pkl'))
joblib.load('credit_risk_model.pkl')