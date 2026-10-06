from __future__ import annotations

from pathlib import Path
from typing import Optional

import joblib
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "alibi_event_model.joblib"
)


def load_model():
    """
    Load the optional ML model.

    If the model is missing, incompatible, corrupted,
    or cannot be loaded for any reason, return None.

    The core evidence-correlation engine does not depend
    on the ML model.
    """
    if not MODEL_PATH.exists():
        return None

    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        return None


def is_model_available() -> bool:
    """
    Safely check whether the optional ML model can be loaded.
    """
    return load_model() is not None


def predict_support_probability(
    features: dict,
) -> Optional[float]:
    """
    Predict optional ML-based support probability.

    This is an auxiliary signal only. If the ML model
    is unavailable, the function returns None and the
    primary rule-based correlation continues normally.
    """

    try:
        model = load_model()

        if model is None:
            return None

        columns = [
            "source_type",
            "in_window",
            "has_location",
            "location_match",
            "has_coordinates",
            "distance_m",
        ]

        values = [
            features.get(column)
            for column in columns
        ]

        dataframe = pd.DataFrame(
            [values],
            columns=columns,
        )

        probability = model.predict_proba(
            dataframe
        )[0][1]

        return round(
            float(probability) * 100,
            1,
        )

    except Exception:
        return None