import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns

df = pd.read_csv('csv/patient_features.csv', sep=';')

df.columns = [
    'age', 'gender', 'num_diseases', 'bmi', 'systolic_bp', 'diastolic_bp',
    'heart_rate', 'hba1c', 'glucose', 'hdl_cholesterol', 'triglycerides',
    'pain_score', 'creatinine', 'egfr', 'hemoglobin', 'qaly_score',
    'gad7_score', 'is_smoker', 'annual_cost'
]

df = df.dropna(subset=['annual_cost'])
df['gender_label'] = df['gender'].map({0: 'Male', 1: 'Female'})
df['smoker_label'] = df['is_smoker'].map({0: 'Non-smoker', 1: 'Smoker'})
df['log_cost'] = np.log1p(df['annual_cost'])

PALETTE = 'Blues_d'
sns.set_theme(style='whitegrid', font_scale=1.1)


# 1 — Target variable distribution (raw + log)
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle('1. Annual Cost Distribution', fontweight='bold')
sns.histplot(df['annual_cost'], kde=True, ax=axes[0], color='steelblue', bins=40)
axes[0].set_title('Raw cost')
axes[0].set_xlabel('Annual Cost ($)')
sns.histplot(df['log_cost'], kde=True, ax=axes[1], color='darkorange', bins=40)
axes[1].set_title('Log-transformed cost')
axes[1].set_xlabel('log(1 + Annual Cost)')
plt.tight_layout()
plt.show()


# 2 — Missing values per feature
fig, ax = plt.subplots(figsize=(12, 5))
fig.suptitle('2. Missing Values per Feature (%)', fontweight='bold')
missing_pct = df.drop(columns=['gender_label', 'smoker_label', 'log_cost']).isnull().mean() * 100
missing_pct = missing_pct[missing_pct > 0].sort_values(ascending=False)
bars = ax.bar(missing_pct.index, missing_pct.values, color='steelblue', edgecolor='white')
ax.bar_label(bars, fmt='%.1f%%', padding=3, fontsize=9)
ax.set_ylabel('Missing (%)')
ax.set_ylim(0, missing_pct.max() * 1.2)
plt.xticks(rotation=30, ha='right')
plt.tight_layout()
plt.show()


# 3 — Age vs. Annual Cost
fig, ax = plt.subplots(figsize=(10, 6))
fig.suptitle('3. Age vs. Annual Cost', fontweight='bold')
sc = ax.scatter(df['age'], df['annual_cost'], alpha=0.4, c=df['num_diseases'],
                cmap='YlOrRd', edgecolors='none', s=30)
plt.colorbar(sc, ax=ax, label='# Diseases')
m, b = np.polyfit(df['age'].dropna(), df.loc[df['age'].notna(), 'annual_cost'], 1)
x_line = np.linspace(df['age'].min(), df['age'].max(), 200)
ax.plot(x_line, m * x_line + b, color='navy', linewidth=2, label=f'Trend (slope={m:.1f})')
ax.legend()
ax.set_xlabel('Age (years)')
ax.set_ylabel('Annual Cost ($)')
plt.tight_layout()
plt.show()


# 4 — Cost by number of diseases (binned)
fig, ax = plt.subplots(figsize=(12, 6))
fig.suptitle('4. Annual Cost by Disease Burden', fontweight='bold')
df['disease_bin'] = pd.cut(df['num_diseases'], bins=[0, 3, 7, 12, 20, df['num_diseases'].max() + 1],
                            labels=['1-3', '4-7', '8-12', '13-20', '20+'], right=False)
sns.boxplot(data=df, x='disease_bin', y='annual_cost', palette='Blues', ax=ax, order=['1-3', '4-7', '8-12', '13-20', '20+'])
ax.set_xlabel('Number of Diseases')
ax.set_ylabel('Annual Cost ($)')
plt.tight_layout()
plt.show()


# 5 — Cost by Gender
fig, ax = plt.subplots(figsize=(8, 6))
fig.suptitle('5. Annual Cost by Gender', fontweight='bold')
gender_data = df.dropna(subset=['gender_label'])
sns.violinplot(data=gender_data, x='gender_label', y='annual_cost',
               palette={'Male': 'steelblue', 'Female': 'salmon'}, inner='quartile', ax=ax)
ax.set_xlabel('Gender')
ax.set_ylabel('Annual Cost ($)')
plt.tight_layout()
plt.show()


# 6 — Cost by Smoking Status
fig, ax = plt.subplots(figsize=(8, 6))
fig.suptitle('6. Annual Cost by Smoking Status', fontweight='bold')
smoker_data = df.dropna(subset=['smoker_label'])
sns.boxplot(data=smoker_data, x='smoker_label', y='annual_cost',
            palette={'Non-smoker': 'mediumseagreen', 'Smoker': 'tomato'}, ax=ax)
ax.set_xlabel('Smoking Status')
ax.set_ylabel('Annual Cost ($)')
plt.tight_layout()
plt.show()


# 7 — BMI vs. Annual Cost
fig, ax = plt.subplots(figsize=(10, 6))
fig.suptitle('7. BMI vs. Annual Cost', fontweight='bold')
bmi_data = df.dropna(subset=['bmi'])
sc = ax.scatter(bmi_data['bmi'], bmi_data['annual_cost'], alpha=0.4,
                c=bmi_data['age'], cmap='plasma', edgecolors='none', s=30)
plt.colorbar(sc, ax=ax, label='Age')
for threshold, label in [(18.5, 'Underweight'), (25, 'Normal'), (30, 'Overweight')]:
    ax.axvline(threshold, color='grey', linestyle='--', linewidth=1)
    ax.text(threshold + 0.2, ax.get_ylim()[1] * 0.95, label, fontsize=8, color='grey')
ax.set_xlabel('BMI (kg/m²)')
ax.set_ylabel('Annual Cost ($)')
plt.tight_layout()
plt.show()


# 8 — Correlation heatmap of numeric features (log_cost used so skew doesn't suppress correlations)
fig, ax = plt.subplots(figsize=(13, 10))
fig.suptitle('8. Feature Correlation Heatmap (target = log cost)', fontweight='bold')
numeric_cols = df.select_dtypes(include='number').drop(
    columns=['gender', 'is_smoker', 'annual_cost'], errors='ignore')
numeric_cols = numeric_cols.rename(columns={'log_cost': 'log_annual_cost'})
corr = numeric_cols.corr()
corr = corr.dropna(axis=0, how='all').dropna(axis=1, how='all')
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, linewidths=0.5, ax=ax, annot_kws={'size': 8})
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()


# 9 — Blood Pressure: Systolic vs Diastolic, colored by cost quartile
fig, ax = plt.subplots(figsize=(10, 7))
fig.suptitle('9. Blood Pressure Landscape (colored by Cost Quartile)', fontweight='bold')
bp_data = df.dropna(subset=['systolic_bp', 'diastolic_bp'])
bp_data = bp_data.copy()
bp_data['cost_quartile'] = pd.qcut(bp_data['annual_cost'], q=4,
                                    labels=['Q1 (low)', 'Q2', 'Q3', 'Q4 (high)'])
palette_q = {'Q1 (low)': 'royalblue', 'Q2': 'mediumseagreen', 'Q3': 'orange', 'Q4 (high)': 'tomato'}
for quartile, group in bp_data.groupby('cost_quartile', observed=True):
    ax.scatter(group['systolic_bp'], group['diastolic_bp'], alpha=0.4,
               label=quartile, color=palette_q[quartile], s=25, edgecolors='none')
ax.axvline(130, color='red', linestyle='--', linewidth=1, alpha=0.6, label='Stage 1 HTN (130)')
ax.axhline(80, color='darkred', linestyle='--', linewidth=1, alpha=0.6, label='Stage 1 HTN (80)')
ax.set_xlabel('Systolic BP (mmHg)')
ax.set_ylabel('Diastolic BP (mmHg)')
ax.legend(title='Cost Quartile', fontsize=9)
plt.tight_layout()
plt.show()


# 10 — Clinical markers distributions (HbA1c, Glucose, Hemoglobin, QALY score)
clinical = {
    'hba1c': ('HbA1c (%)', 'mediumpurple'),
    'glucose': ('Glucose (mg/dL)', 'darkorange'),
    'hemoglobin': ('Hemoglobin (g/dL)', 'crimson'),
    'qaly_score': ('QALY Score', 'steelblue'),
}
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle('10. Clinical Marker Distributions', fontweight='bold')
for ax, (col, (label, color)) in zip(axes.flat, clinical.items()):
    data = df[col].dropna()
    sns.histplot(data, kde=True, ax=ax, color=color, bins=30)
    ax.set_title(label)
    ax.set_xlabel('')
    ax.axvline(data.median(), color='black', linestyle='--', linewidth=1.2, label=f'Median: {data.median():.1f}')
    ax.legend(fontsize=9)
plt.tight_layout()
plt.show()
