import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import HistGradientBoostingRegressor

df = pd.read_csv('csv/patient_features.csv', sep=';')

y = np.log1p(df['target_avg_annual_cost'])
X = df.drop(columns=['target_avg_annual_cost'])

# add a missingness flag for each column that has nulls
for col in X.select_dtypes(include='number').columns:
    if X[col].isnull().any():
        X[col + '_missing'] = X[col].isnull().astype(int)

train_X, val_X, train_y, val_y = train_test_split(X, y, random_state=0)

# median impute and scale fitted on train only to avoid leakage
medians = train_X.median().fillna(0)
train_X = train_X.fillna(medians)
val_X = val_X.fillna(medians)

scaler = StandardScaler()
train_X = pd.DataFrame(scaler.fit_transform(train_X), columns=train_X.columns)
val_X = pd.DataFrame(scaler.transform(val_X), columns=val_X.columns)

model = HistGradientBoostingRegressor(random_state=1)
model.fit(train_X, train_y)

val_predictions = model.predict(val_X)
mae = mean_absolute_error(np.expm1(val_y), np.expm1(val_predictions))
print(f"MAE: ${mae:,.2f}")