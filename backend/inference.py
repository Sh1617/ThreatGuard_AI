import joblib
import pandas as pd



model = joblib.load(
    "../models/final_multi_attack_model.pkl"
)


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


def get_supported_attacks():

    return list(encoder.classes_)