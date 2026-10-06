# Digital Evidence Correlation System — Demo Build

## Backend
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```
Backend: http://127.0.0.1:8000/docs

## Frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:3000

## First login
Open `/login` and choose **New investigator? Create account**. Create an account with a password of at least 8 characters. The page automatically signs in after registration.

## Demo flow
1. Login/register.
2. Create a case. Example: `City Central Mall Incident`, suspect `Rahul Sharma`, claimed location `City Central Mall`.
3. Set alibi start `2026-08-31 18:00` and end `2026-08-31 20:00`.
4. Upload `demo/demo_gps.csv` as **GPS**.
5. Open the case details and verify the evidence inventory and SHA-256 hash.
6. Run **AI analysis**. The sample has 3 events inside the claimed window and 1 conflicting event, so the result demonstrates both matched and conflicting evidence.
7. Open Timeline to show normalized events.
8. Open Reports and download the generated investigation report.

## Important
Do not commit or share `.env`. Configure `DATABASE_URL` and `JWT_SECRET_KEY` in your local `.env`.

## Evidence correlation demo datasets
The correlation engine now distinguishes **matched**, **conflicting**, and **neutral** evidence:
- Evidence inside the alibi window + matching location = matched.
- Evidence inside the alibi window + different location = conflicting.
- Evidence outside the alibi window = neutral (it is not a contradiction by itself).
- Evidence with no usable timestamp/location = neutral and does not receive an invented alibi location.

Demo files:
- `demo/gps_supporting.csv` → 3 matched + 1 neutral → 100% supported.
- `demo/gps_conflicting.csv` → 1 matched + 2 conflicting → 33.3% contradicted.
- `demo/cctv_mixed.csv` → 3 matched + 1 conflicting → 75% inconclusive.
- `demo/transactions_conflict.csv` → 1 matched + 1 conflicting → 50% inconclusive.
- `demo/social_media_neutral.csv` → 0 relevant events → 50% inconclusive.

After uploading new evidence, any previous analysis result is cleared. Run analysis again so the score always reflects the current complete evidence set.

## Enhanced real-media support

The enhanced build accepts real image and CCTV/video files. It extracts available EXIF/video metadata and optionally OCRs timestamps/location overlays when Tesseract is installed. It never assumes that an unstructured file proves a location or time when that information is absent.

For GPS correlation, optionally enter the claimed alibi latitude/longitude when creating the case. GPS events are compared to the claimed coordinates using a 150 m tolerance.

See `TRAINING_GUIDE.md` for the trainable ML layer. The bundled ML model is a synthetic baseline/calibration model; it is not trained on real forensic evidence.

---

## Professional final-year build additions

The latest build includes authenticated media preview, SHA-256 integrity display, provenance/acquisition metadata, real image/video metadata extraction, OCR where available, structured GPS/CSV/JSON ingestion, timeline reconstruction, and explainable correlation. See `JUDGE_DEMO_GUIDE.md` for the recommended presentation and dataset guidance.


## GeoLife GPS validation
The system ingests Microsoft GeoLife `.plt` trajectories directly, extracting timestamp, latitude, longitude and altitude into normalized timeline events. After upload, verify `timeline_events_created` is greater than zero before running correlation.
