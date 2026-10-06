# Trainable alibi-correlation model

This build contains a **hybrid evidence engine**:

1. Deterministic forensic correlation is the primary decision layer.
2. A Random Forest model can provide an auxiliary per-event support probability when a trained model is present.
3. The system never treats the upload time as the evidence timestamp and never invents a location for an unstructured file.

## What can be automated from real evidence?

### GPS CSV/JSON
Provide timestamp plus either a location label or latitude/longitude. If the case also has claimed latitude/longitude, the engine compares GPS distance using a 150 m tolerance.

### Real images
The processor reads EXIF fields such as DateTimeOriginal and GPS when present. If Tesseract is installed, it also samples OCR text for a timestamp and `Location:` overlay.

### Real CCTV/video
The processor accepts MP4/MOV/AVI/MKV/WEBM/M4V, records video metadata (FPS, frames, duration), and, when Tesseract is installed, OCRs a few frames for CCTV date/time/location overlays. A video with no trustworthy timestamp/location cannot by itself establish an alibi event; the UI therefore offers optional event timestamp/location fields.

## Training the ML model

The included `training/alibi_training_template.csv` is a **synthetic baseline/calibration dataset**. It is not a forensic ground-truth dataset and its training accuracy must not be presented as real-world accuracy.

To train with your own labeled data, replace the CSV with labeled examples containing:

- `source_type`
- `in_window` (0/1)
- `has_location` (0/1)
- `location_match` (0/1)
- `has_coordinates` (0/1)
- `distance_m` (blank when unavailable)
- `label` (1 = supports the alibi, 0 = contradicts/does not support)

Run from `backend`:

```powershell
python -m app.ai.train_model --csv ../training/alibi_training_template.csv
```

The model is saved as:

```text
backend/models/alibi_event_model.joblib
```

For a serious research system, train and evaluate it on a sufficiently large, independently labeled dataset, using a held-out test set and documented annotation rules. Do not use synthetic examples as evidence of forensic accuracy.

## Recommended final demo

Create one case, upload multiple real evidence files to that same case, then run analysis once. The result combines all timestamped/location-bearing events across sources. Show the event-level reasons, SHA-256 hashes, source breakdown, timeline, confidence score, and final verdict.
