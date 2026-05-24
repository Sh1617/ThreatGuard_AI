import joblib
import pandas as pd



model = joblib.load(
    "../models/final_multi_attack_model.pkl"
)


encoder = joblib.load(
    "../models/final_multi_attack_encoder.pkl"
)



EXPECTED_COLUMNS = model.get_booster().feature_names


def predict_attack(data: dict):

    
    input_df = pd.DataFrame([data])

    
    for col in EXPECTED_COLUMNS:

        if col not in input_df.columns:
            input_df[col] = 0

    
    input_df = input_df[EXPECTED_COLUMNS]

    
    prediction = model.predict(input_df)

    
    attack = encoder.inverse_transform(
        prediction
    )[0]

    return attack


def get_supported_attacks():

    return list(encoder.classes_)