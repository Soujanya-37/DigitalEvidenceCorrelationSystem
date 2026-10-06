# Digital Evidence Correlation System for Alibi Verification

> **Major Engineering Capstone Project**  
> An automated decision-support platform designed to ingest multi-source digital footprints, reconstruct unified spatio-temporal timelines, and mathematically verify claimed subject alibis.

---

## 📌 Problem Overview
In criminal and digital forensic investigations, suspects present alibi assertions (e.g., *"I was at Location X between 09:00 and 10:00"*). Investigators must cross-correlate disparate, heterogeneous evidence files (GPS trajectories, surveillance video, photographic EXIF, payment transactions, and phone records).

Manual alignment is labor-intensive and prone to error. This system provides **cryptographic chain-of-custody intake**, **timeline normalization**, and an **explainable alibi correlation engine** applying the **150m Haversine geographic distance formula** and **source modality weighting**.

---

## 🛠️ System Architecture

1. **Intake & Hashing**: Immediate SHA-256 calculation for non-repudiation.
2. **Metadata & OCR Extraction**:
   - GPS / Microsoft GeoLife `.plt` telemetry extraction
   - Photographic EXIF parsing via Pillow
   - Video frame and timestamp processing via OpenCV
   - Timestamp overlay extraction via Tesseract OCR
3. **Timeline Reconstruction**: Normalizes heterogeneous data points into a unified temporal sequence.
4. **Deterministic Correlation Engine**:
   - Temporal window overlap filtering ($T_{start} \le T_{ev} \le T_{end}$)
   - Haversine great-circle distance tolerance ($\le 150\text{ m}$)
   - Source modality weights ($W = 0.75$ to $1.00$)
   - Formula: $\text{Consistency Score} = \left(\frac{W_{\text{Match}}}{W_{\text{Relevant}}}\right) \times 100$
5. **Explainable Decision Support**: Output classified as **Supported**, **Contradicted**, or **Inconclusive** (*no evidence $\neq$ contradiction*).

---

## 💻 Tech Stack
- **Backend**: FastAPI (Python 3.12), SQLAlchemy, Alembic, PostgreSQL (`psycopg`), Pydantic
- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Lucide Icons
- **Forensic & Data**: GeoLife trajectory parser, Pillow, OpenCV, Tesseract OCR, Scikit-learn

---

## 🚀 Getting Started

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Web Application: [http://localhost:3000](http://localhost:3000)

---

## 📄 License & Attribution
Developed as an Academic Engineering Major Project.
