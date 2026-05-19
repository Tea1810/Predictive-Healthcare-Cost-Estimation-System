export const FIELDS = {
  required: [
    { key: 'age',          label: 'Age',                type: 'number', min: 0, max: 120, step: 1,    placeholder: 'e.g. 45' },
    { key: 'num_diseases', label: 'Number of Diseases', type: 'number', min: 0, max: 50,  step: 1,    placeholder: 'e.g. 2' },
  ],
  optional: [
    { key: 'bmi',             label: 'BMI',             unit: 'kg/m²', step: 0.1,  placeholder: '18–40' },
    { key: 'systolic_bp',     label: 'Systolic BP',     unit: 'mmHg',  step: 1,    placeholder: '90–180' },
    { key: 'diastolic_bp',    label: 'Diastolic BP',    unit: 'mmHg',  step: 1,    placeholder: '60–120' },
    { key: 'heart_rate',      label: 'Heart Rate',      unit: '/min',  step: 1,    placeholder: '40–120' },
    { key: 'hba1c',           label: 'HbA1c',           unit: '%',     step: 0.1,  placeholder: '4–14' },
    { key: 'glucose',         label: 'Glucose',         unit: 'mg/dL', step: 1,    placeholder: '70–400' },
    { key: 'hdl_cholesterol', label: 'HDL Cholesterol', unit: 'mg/dL', step: 1,    placeholder: '20–100' },
    { key: 'triglycerides',   label: 'Triglycerides',   unit: 'mg/dL', step: 1,    placeholder: '50–500' },
    { key: 'pain_score',      label: 'Pain Score',      unit: '0–10',  step: 0.5,  placeholder: '0–10' },
    { key: 'creatinine',      label: 'Creatinine',      unit: 'mg/dL', step: 0.01, placeholder: '0.5–5' },
    { key: 'egfr',            label: 'eGFR',            unit: '',      step: 1,    placeholder: '5–120' },
    { key: 'hemoglobin',      label: 'Hemoglobin',      unit: 'g/dL',  step: 0.1,  placeholder: '7–18' },
    { key: 'qaly_score',      label: 'QALY Score',      unit: '0–1',   step: 0.01, placeholder: '0–1' },
    { key: 'gad7_score',      label: 'GAD-7 Score',     unit: '0–21',  step: 1,    placeholder: '0–21' },
  ],
}

export const initialForm = {
  age: '35',
  gender: '0',
  num_diseases: '0',
  is_smoker: '0',
  bmi: '', systolic_bp: '', diastolic_bp: '', heart_rate: '',
  hba1c: '', glucose: '', hdl_cholesterol: '', triglycerides: '',
  pain_score: '', creatinine: '', egfr: '', hemoglobin: '',
  qaly_score: '', gad7_score: '',
}
