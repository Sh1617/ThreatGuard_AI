import joblib
import pandas as pd


# Load trained model
model = joblib.load(
    "../models/final_multi_attack_model.pkl"
)

# Load label encoder
encoder = joblib.load(
    "../models/final_multi_attack_encoder.pkl"
)


def predict_attack(data: dict):

    input_df = pd.DataFrame([data])

    prediction = model.predict(input_df)

    attack = encoder.inverse_transform(
        prediction
    )[0]

    return attack