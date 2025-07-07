import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import json

# Load your new dataset
df = pd.read_csv('ORGANDONATIONBLOCK.csv')

# Features and target (update if you change column names)
features = ['Donor_Blood', 'Donor_Age', 'Patient_Blood', 'Patient_Age', 'Organ']
target = 'Match_Score'

# Encode categorical features
X = pd.get_dummies(df[features])
y = df[target]

# Train the model
model = RandomForestRegressor(n_estimators=20, random_state=42)
model.fit(X, y)

# Save the model and feature columns
joblib.dump((model, X.columns.tolist()), 'rf_model.joblib')
print("Model trained and saved as rf_model.joblib")

# Export to JSON for web app use
def export_model_to_json(model, feature_names, output_file):
    """Export Random Forest model to JSON format for JavaScript use"""
    model_data = {
        'n_estimators': model.n_estimators,
        'trees': []
    }
    
    for tree in model.estimators_:
        tree_data = {
            'feature': tree.tree_.feature.tolist(),
            'threshold': tree.tree_.threshold.tolist(),
            'value': tree.tree_.value.flatten().tolist(),
            'children_left': tree.tree_.children_left.tolist(),
            'children_right': tree.tree_.children_right.tolist()
        }
        model_data['trees'].append(tree_data)
    
    with open(output_file, 'w') as f:
        json.dump(model_data, f, indent=2)

# Export to JSON for web app
export_model_to_json(model, X.columns.tolist(), 'src/random_forest_model.json')
print("Model exported to JSON format for web app use")