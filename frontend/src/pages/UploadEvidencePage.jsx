import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  FileText,
  ImagePlus,
  MapPin,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
  Video,
  CreditCard,
  Smartphone,
  Database,
  ArrowRight,
  Clock
} from "lucide-react";
import PageCard from "../components/PageCard";
import { getCases, getCaseById } from "../services/caseService";
import { uploadEvidence } from "../services/evidenceService";

const evidenceTypesList = [
  { value: 'gps', label: 'GPS / GeoLife .plt / Telemetry', icon: MapPin },
  { value: 'cctv', label: 'CCTV / Video Surveillance', icon: Video },
  { value: 'image', label: 'Photograph / EXIF Metadata', icon: Camera },
  { value: 'video', label: 'Video Recording', icon: Video },
  { value: 'transaction', label: 'Financial / ATM Transaction', icon: CreditCard },
  { value: 'bank', label: 'Bank Account Record', icon: CreditCard },
  { value: 'phone_log', label: 'Call Detail Record (CDR) / Phone Log', icon: Smartphone },
  { value: 'sms', label: 'SMS / Messaging Data', icon: Smartphone },
  { value: 'device', label: 'Device / System Event Log', icon: Database },
  { value: 'document', label: 'Document / PDF Report', icon: FileText },
  { value: 'social_media', label: 'Social Media Activity', icon: FileText },
  { value: 'other', label: 'Other Digital Footprint', icon: FileText },
];

export default function UploadEvidencePage() {
  const [searchParams] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(searchParams.get("case_id") || "");
  const [currentCase, setCurrentCase] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState("gps");
  const [description, setDescription] = useState("");
  const [eventTimestamp, setEventTimestamp] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [provenance, setProvenance] = useState("Investigator upload");
  const [acquisitionMethod, setAcquisitionMethod] = useState("Direct forensic export");

  const [loadingCases, setLoadingCases] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCases()
      .then(data => {
        setCases(data);
        if (!selectedCase && data.length > 0) {
          setSelectedCase(data[0].id);
        }
      })
      .catch(err => setError(err.response?.data?.detail || "Unable to load cases."))
      .finally(() => setLoadingCases(false));
  }, []);

  useEffect(() => {
    if (selectedCase) {
      getCaseById(selectedCase).then(setCurrentCase).catch(() => setCurrentCase(null));
    }
  }, [selectedCase]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setResultData(null);
    setError("");

    // Auto-detect evidence type from extension
    const name = f.name.toLowerCase();
    if (name.endsWith('.plt') || name.includes('gps') || (name.endsWith('.csv') && name.includes('geo'))) {
      setEvidenceType('gps');
    } else if (name.endsWith('.mp4') || name.endsWith('.avi') || name.endsWith('.mov') || name.includes('cctv')) {
      setEvidenceType('cctv');
    } else if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
      setEvidenceType('image');
    } else if (name.includes('trans') || name.includes('bank') || name.includes('atm')) {
      setEvidenceType('transaction');
    }
  };

  const handleUpload = async () => {
    setResultData(null);
    setError("");

    if (!selectedCase) return setError("Please select an investigation case first.");
    if (!selectedFile) return setError("Please choose a digital evidence file.");

    try {
      setUploading(true);
      const res = await uploadEvidence(
        selectedFile,
        selectedCase,
        evidenceType,
        description,
        eventTimestamp,
        eventLocation,
        provenance,
        acquisitionMethod
      );

      setResultData(res);
      setSelectedFile(null);
      setDescription("");
      setEventTimestamp("");
      setEventLocation("");
      const el = document.getElementById("ev-upload-input");
      if (el) el.value = "";
    } catch (err) {
      console.error("Evidence upload failed:", err);
      setError(err.response?.data?.detail || "Evidence ingestion and parsing failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageCard
      title="Digital Evidence Intake & Ingestion"
      description="Ingest multi-modal digital evidence, calculate cryptographic SHA-256 integrity hashes, and extract timeline events."
    >
      {/* Case Selection & Alibi Reference Banner */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 mb-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Investigation Case</label>
            <select
              value={selectedCase}
              onChange={e => {
                setSelectedCase(e.target.value);
                setResultData(null);
                setError("");
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white"
              disabled={loadingCases}
            >
              <option value="">Select a case...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.suspect_name} ({c.title})
                </option>
              ))}
            </select>
          </div>

          {currentCase && (
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-xs space-y-1">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Claimed Alibi Reference</span>
              <p className="text-white font-medium">{currentCase.claimed_alibi_location || 'No location specified'}</p>
              <p className="font-mono text-[10px] text-slate-400">
                {currentCase.claimed_alibi_start ? new Date(currentCase.claimed_alibi_start).toLocaleTimeString() : '—'} → {currentCase.claimed_alibi_end ? new Date(currentCase.claimed_alibi_end).toLocaleTimeString() : '—'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Upload Grid */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left: Drag & Drop File Zone */}
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-7 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
              <UploadCloud size={24} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-white">
              {selectedFile ? selectedFile.name : "Select Evidence Artifact to Ingest"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {selectedFile
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for cryptographic intake`
                : "GeoLife .plt, GPS CSV, CCTV / Video, EXIF Photographs, Bank Logs, PDF & Text"}
            </p>

            <label
              htmlFor="ev-upload-input"
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition"
            >
              <ImagePlus size={14} /> Browse Evidence File
            </label>

            <input
              id="ev-upload-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.webp,.tif,.tiff,.mp4,.mov,.avi,.mkv,.webm,.m4v,.csv,.json,.plt,.pdf,.doc,.docx,.txt"
            />
          </div>

          {/* Forensic Integrity Banner */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs">
            <h4 className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-400" /> Chain of Custody & Hashing Protocol
            </h4>
            <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">
              Upon selection, the backend calculates an SHA-256 cryptographic checksum. The file is preserved verbatim for auditability and evidentiary integrity.
            </p>
          </div>
        </div>

        {/* Right: Ingestion Parameters Form */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Ingestion Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Evidence Modality Type *</label>
            <select
              value={evidenceType}
              onChange={e => setEvidenceType(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white"
            >
              {evidenceTypesList.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Provenance / Source</label>
              <input
                type="text"
                value={provenance}
                onChange={e => setProvenance(e.target.value)}
                placeholder="e.g. Traffic camera archive"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Acquisition Method</label>
              <input
                type="text"
                value={acquisitionMethod}
                onChange={e => setAcquisitionMethod(e.target.value)}
                placeholder="e.g. NVR export / USB retrieval"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Event Timestamp (Fallback)</label>
            <input
              type="datetime-local"
              value={eventTimestamp}
              onChange={e => setEventTimestamp(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white font-mono"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Only used if file lacks internal EXIF/GPS timestamps.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Event Location (Fallback)</label>
            <input
              type="text"
              value={eventLocation}
              onChange={e => setEventLocation(e.target.value)}
              placeholder="e.g. City Central Mall Gate 3"
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Investigator Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe origin, context, and case relevance..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white placeholder:text-slate-500 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !selectedCase}
            className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-semibold text-slate-950 transition disabled:opacity-40"
          >
            {uploading ? "Ingesting & Calculating Hash…" : "Ingest & Calculate SHA-256 →"}
          </button>
        </div>
      </div>

      {/* Success Ingestion Result Card */}
      {resultData && (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 size={18} /> Evidence Ingested Successfully
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">FILE NAME:</span>
              <span className="font-bold text-white truncate block">{resultData.original_filename}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EVIDENCE TYPE:</span>
              <span className="font-bold text-cyan-300 uppercase">{resultData.evidence_type}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TIMELINE EVENTS EXTRACTED:</span>
              <span className="font-bold text-emerald-400 text-sm">{resultData.timeline_events_created || 0}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">STATUS:</span>
              <span className="font-bold text-slate-200">{resultData.upload_status || 'PROCESSED'}</span>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 border-t border-slate-800/80 pt-2">
              <span className="text-slate-500 block text-[10px]">CRYPTOGRAPHIC INTEGRITY HASH (SHA-256):</span>
              <span className="font-mono text-cyan-300 text-xs break-all select-all">{resultData.sha256_hash}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to={`/timeline?case_id=${selectedCase}`}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"
            >
              <Clock size={13} /> View Extracted Timeline Events →
            </Link>
            <Link
              to={`/ai-analysis?case_id=${selectedCase}`}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white"
            >
              Run Alibi Correlation →
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </PageCard>
  );
}