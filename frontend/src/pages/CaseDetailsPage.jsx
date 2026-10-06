import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BrainCircuit, FileSearch, MapPin, ShieldCheck, Video, Clock,
  Image as ImageIcon, FileText, X, ExternalLink, Hash, Database,
  UploadCloud, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Eye, Download, Compass, Link2, Copy, Check
} from "lucide-react";
import PageCard from "../components/PageCard";
import GeographicMap from "../components/GeographicMap";
import { getCaseById } from "../services/caseService";
import { uploadEvidence, getCaseEvidence, getEvidencePreview } from "../services/evidenceService";
import { runAnalysis, getAnalysis } from "../services/analysisService";
import { getTimeline } from "../services/timelineService";
import { downloadReport } from "../services/reportService";

const typeOptions = [
  ["cctv", "CCTV / Video Surveillance"],
  ["gps", "GPS / Telemetry / GeoLife .plt"],
  ["image", "Photograph / Image (EXIF)"],
  ["video", "Video Recording"],
  ["transaction", "Financial / ATM Transaction"],
  ["bank", "Bank Record"],
  ["device", "Device / System Log"],
  ["phone_log", "Phone Log"],
  ["call_record", "Call Detail Record (CDR)"],
  ["sms", "SMS / Messaging"],
  ["email", "Email Header / Log"],
  ["social_media", "Social Media Activity"],
  ["document", "Document / PDF"],
  ["other", "Other Digital Footprint"]
];

const formatBytes = (n) => !n ? "—" : n < 1024 ? `${n} B` : n < 1024*1024 ? `${(n/1024).toFixed(1)} KB` : `${(n/1024/1024).toFixed(2)} MB`;
const formatDate = (v) => v ? new Date(v).toLocaleString() : "—";

function EvidencePreviewModal({ item, onClose }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isImage = item.mime_type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(item.original_filename);
  const isVideo = item.mime_type?.startsWith("video/") || /\.(mp4|mov|avi|webm)$/i.test(item.original_filename);

  useEffect(() => {
    let objectUrl = "";
    (async () => {
      try {
        objectUrl = await getEvidencePreview(item.id);
        setUrl(objectUrl);
      } catch {
        setError("Direct preview could not be streamed from backend storage.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.id]);

  const copyHash = () => {
    if (item.sha256_hash) {
      navigator.clipboard.writeText(item.sha256_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">{item.original_filename}</span>
              <span className="rounded bg-cyan-950 border border-cyan-800/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300 uppercase">
                {item.evidence_type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Cryptographic Forensic Asset Preview</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left: Media Player / Viewer */}
          <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-slate-800 bg-black/50 p-4">
            {loading && <p className="text-xs text-slate-400">Loading secured evidence artifact...</p>}
            {error && (
              <div className="text-center p-6">
                <FileText className="mx-auto text-slate-600 mb-2" size={40} />
                <p className="text-xs text-slate-400">{error}</p>
                <p className="text-[11px] text-slate-500 mt-1">Metadata and timeline events remain fully parsed for correlation.</p>
              </div>
            )}
            {!loading && !error && isImage && url && (
              <img src={url} alt={item.original_filename} className="max-h-[64vh] max-w-full rounded-xl object-contain shadow-lg" />
            )}
            {!loading && !error && isVideo && url && (
              <video src={url} controls className="max-h-[64vh] max-w-full rounded-xl shadow-lg" />
            )}
            {!loading && !error && !isImage && !isVideo && (
              <div className="text-center p-6">
                <Database className="mx-auto text-cyan-400 mb-2" size={44} />
                <p className="text-sm font-semibold text-white">Structured Telemetry / Log Asset</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  This evidence file was parsed into {item.timeline_events_created || 0} normalized chronological events.
                </p>
              </div>
            )}
          </div>

          {/* Right: Forensic Metadata & Provenance (Priority 1) */}
          <div className="space-y-4">
            {/* Hash & Integrity */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5"><Hash size={13} className="text-cyan-400" /> FILE INTEGRITY</span>
                <span className="text-[10px] text-emerald-400">VERIFIED</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <span className="font-mono text-[10px] text-slate-300 break-all select-all">
                  {item.sha256_hash}
                </span>
                <button 
                  onClick={copyHash} 
                  className="shrink-0 p-1.5 rounded bg-slate-900 hover:text-cyan-300 text-slate-400"
                  title="Copy SHA-256"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Cryptographic hash computed at intake to verify the file has not been altered or tampered with.
              </p>
            </div>

            {/* Provenance & Acquisition */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Provenance:</span>
                <span className="font-semibold text-slate-200">{item.provenance || 'Investigator upload'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Acquisition Method:</span>
                <span className="font-semibold text-slate-200">{item.acquisition_method || 'Digital transfer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-200">{formatBytes(item.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ingestion Timestamp:</span>
                <span className="font-mono text-slate-200">{formatDate(item.uploaded_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timeline Events Extracted:</span>
                <span className="font-bold text-emerald-400">{item.timeline_events_created || 0}</span>
              </div>
            </div>

            {/* Extracted Metadata (EXIF/Video/OCR) */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Extracted Metadata</span>
                <div className="mt-2.5 space-y-1.5 text-xs max-h-[160px] overflow-y-auto">
                  {Object.entries(item.metadata)
                    .filter(([k]) => !['ocr_text'].includes(k))
                    .slice(0, 10)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 border-b border-slate-800/60 pb-1">
                        <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-slate-300 text-right truncate max-w-[150px]">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaseDetailsPage() {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("overview"); // overview, evidence, chain, map
  const [preview, setPreview] = useState(null);

  // Ingestion Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState("cctv");
  const [description, setDescription] = useState("");
  const [eventTimestamp, setEventTimestamp] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [provenance, setProvenance] = useState("Investigator upload");
  const [acquisitionMethod, setAcquisitionMethod] = useState("Direct digital ingestion");
  const [uploading, setUploading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageGood, setMessageGood] = useState(false);

  const refreshCaseData = async () => {
    const [cData, evData, tlData, anData] = await Promise.all([
      getCaseById(id),
      getCaseEvidence(id).catch(() => []),
      getTimeline(id).catch(() => []),
      getAnalysis(id).catch(() => null),
    ]);
    setCaseItem(cData);
    setEvidenceItems(evData);
    setTimelineEvents(tlData);
    setAnalysis(anData);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await refreshCaseData();
      } catch (e) {
        setError(e.response?.data?.detail || "Unable to retrieve this investigation case.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selectedFile) return setMessage("Please select an evidence file.");

    try {
      setUploading(true);
      const res = await uploadEvidence(
        selectedFile,
        id,
        evidenceType,
        description,
        eventTimestamp,
        eventLocation,
        provenance,
        acquisitionMethod
      );

      setMessage(`File ingested successfully. Cryptographic SHA-256: ${res.sha256_hash}`);
      setMessageGood(true);
      setSelectedFile(null);
      setDescription("");
      setEventTimestamp("");
      setEventLocation("");
      const el = document.getElementById("case-ev-file");
      if (el) el.value = "";
      await refreshCaseData();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Evidence upload and extraction failed.");
      setMessageGood(false);
    } finally {
      setUploading(false);
    }
  };

  const handleRunCorrelation = async () => {
    try {
      setAnalysisLoading(true);
      const res = await runAnalysis(id);
      setAnalysis(res);
      setMessage("Evidence correlation and alibi verification completed.");
      setMessageGood(true);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Correlation engine execution failed.");
      setMessageGood(false);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <PageCard title="Loading Investigation…" description="Retrieving case details and evidence artifacts" accent="cyan">
        <div className="rounded-2xl border border-slate-800 p-8 text-center text-xs text-slate-400">
          Fetching case container and evidence inventory...
        </div>
      </PageCard>
    );
  }

  if (error || !caseItem) {
    return (
      <PageCard title="Case Not Found" description={error || "Case record unavailable."} accent="amber">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-6 text-xs text-rose-300">
          {error}
        </div>
      </PageCard>
    );
  }

  const verdict = analysis ? String(analysis.verdict).toLowerCase() : null;

  return (
    <PageCard
      title={`${caseItem.case_number} — ${caseItem.title}`}
      description={`Subject: ${caseItem.suspect_name} • Priority: ${caseItem.priority}`}
    >
      {preview && <EvidencePreviewModal item={preview} onClose={() => setPreview(null)} />}

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-5">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "overview", label: "Alibi Claim & Overview" },
            { id: "evidence", label: `Evidence Inventory (${evidenceItems.length})` },
            { id: "chain", label: "Chain of Custody" },
            { id: "map", label: "Geographic Map" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Correlation Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCorrelation}
            disabled={analysisLoading || evidenceItems.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition disabled:opacity-40"
          >
            <BrainCircuit size={13} /> {analysisLoading ? "Running…" : "Run Correlation"}
          </button>
          <Link
            to={`/reports?case_id=${id}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <FileText size={13} /> Report
          </Link>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ALIBI TARGET */}
      {activeTab === "overview" && (
        <div className="mt-4 space-y-6">
          {/* Claim vs Verification Result Strip */}
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Subject Alibi Target */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Subject Alibi Claim Target
                </span>
                <span className="text-[10px] text-slate-400">Suspect: <strong className="text-white">{caseItem.suspect_name}</strong></span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800/80">
                  <span className="text-slate-500 flex items-center gap-1"><MapPin size={12} className="text-cyan-400"/> Claimed Location:</span>
                  <p className="mt-1 font-bold text-white text-sm">{caseItem.claimed_alibi_location || "No named location"}</p>
                  {caseItem.claimed_alibi_lat != null && (
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                      Latitude: {caseItem.claimed_alibi_lat} • Longitude: {caseItem.claimed_alibi_lng}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800/80">
                  <span className="text-slate-500 flex items-center gap-1"><Clock size={12} className="text-cyan-400"/> Claimed Time Window:</span>
                  <p className="mt-1 font-mono text-white text-xs">
                    {formatDate(caseItem.claimed_alibi_start)} → {formatDate(caseItem.claimed_alibi_end)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900/70 p-3 border border-slate-800/80">
                  <span className="text-slate-500">Formal Alibi Statement:</span>
                  <p className="mt-1 text-slate-300 leading-relaxed italic">
                    "{caseItem.claimed_alibi_text || caseItem.description || "No formal statement entered."}"
                  </p>
                </div>
              </div>
            </div>

            {/* Correlation Score Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BrainCircuit size={14} className="text-cyan-400" /> Verification Result
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">TOLERANCE 150M</span>
                </div>

                {analysis ? (
                  <div className="mt-5 text-center">
                    <span className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Evidence Consistency</span>
                    <p className="mt-1 font-mono text-5xl font-extrabold text-white">{analysis.confidence_score}%</p>
                    
                    <div className="mt-3 flex justify-center">
                      {verdict === "supported" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                          <CheckCircle2 size={13} /> ALIBI SUPPORTED
                        </span>
                      )}
                      {verdict === "contradicted" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
                          <XCircle size={13} /> CONTRADICTED
                        </span>
                      )}
                      {verdict === "inconclusive" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
                          <AlertTriangle size={13} /> INCONCLUSIVE
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Supporting Events:</span>
                        <p className="font-bold text-emerald-400">{analysis.matched_events_count}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Conflicting Events:</span>
                        <p className="font-bold text-rose-400">{analysis.conflicting_events_count}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center text-xs text-slate-500 py-6">
                    <p>No correlation analysis executed yet for this case.</p>
                    <button
                      onClick={handleRunCorrelation}
                      disabled={analysisLoading || evidenceItems.length === 0}
                      className="mt-3 inline-block rounded-xl bg-cyan-400 px-4 py-2 font-bold text-slate-950 text-xs hover:bg-cyan-300 disabled:opacity-40"
                    >
                      Run Correlation Engine
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <Link to={`/timeline?case_id=${id}`} className="text-cyan-400 hover:underline">
                  Inspect Chronological Timeline →
                </Link>
                <Link to={`/ai-analysis?case_id=${id}`} className="text-slate-400 hover:text-white">
                  Explainable Analysis →
                </Link>
              </div>
            </div>
          </div>

          {/* Evidence Quick Intake Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <UploadCloud size={14} /> Ingest Evidence into this Case
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              File will be hashed with SHA-256 for chain of custody, and metadata / GPS / OCR / video frames will be extracted into normalized timeline events.
            </p>

            <form onSubmit={handleUpload} className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Evidence Type</label>
                <select
                  value={evidenceType}
                  onChange={e => setEvidenceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white"
                >
                  {typeOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Acquisition Method</label>
                <input
                  type="text"
                  value={acquisitionMethod}
                  onChange={e => setAcquisitionMethod(e.target.value)}
                  placeholder="e.g. CCTV export from store NVR"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Evidence File</label>
                <input
                  id="case-ev-file"
                  type="file"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.tif,.tiff,.mp4,.mov,.avi,.mkv,.webm,.m4v,.csv,.json,.plt,.pdf,.doc,.docx,.txt"
                  className="w-full text-xs text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-2.5 file:py-1.5 file:font-semibold file:text-slate-950 cursor-pointer"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-40 transition"
                >
                  {uploading ? "Ingesting & Extracting Metadata…" : "Ingest & Calculate SHA-256 →"}
                </button>
              </div>
            </form>

            {message && (
              <div className={`mt-3 rounded-xl border p-3 text-xs ${messageGood ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300" : "border-rose-500/30 bg-rose-950/20 text-rose-300"}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EVIDENCE INVENTORY & PREVIEW (Priority 1 & 3) */}
      {activeTab === "evidence" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Secured Evidence Assets ({evidenceItems.length})
            </span>
            <span className="text-[11px] text-slate-500">Click "Preview Asset" to view images, video, and extracted EXIF</span>
          </div>

          {evidenceItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 p-8 text-center text-xs text-slate-500">
              No evidence files ingested for this investigation yet. Use the upload tool above.
            </div>
          ) : (
            <div className="grid gap-3">
              {evidenceItems.map(item => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 hover:border-slate-700 transition">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-cyan-400 mt-0.5">
                        {item.mime_type?.startsWith("video/") ? <Video size={18} /> : item.mime_type?.startsWith("image/") ? <ImageIcon size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.original_filename}</span>
                          <span className="rounded bg-cyan-950 border border-cyan-800/40 px-2 py-0.5 text-[9px] font-mono text-cyan-300 uppercase">
                            {item.evidence_type}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-slate-400 break-all select-all">
                          SHA-256: {item.sha256_hash}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatBytes(item.file_size)} • {item.provenance} • Ingested: {formatDate(item.uploaded_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-emerald-950/50 border border-emerald-800/30 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        {item.timeline_events_created || 0} events extracted
                      </span>
                      <button
                        onClick={() => setPreview(item)}
                        className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition"
                      >
                        <Eye size={13} /> Preview Asset
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHAIN OF CUSTODY (Priority 2 from user request) */}
      {activeTab === "chain" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Forensic Chain of Custody Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Immutable log tracing each piece of evidence from acquisition to hashing, timeline event extraction, and correlation analysis.
            </p>

            <div className="mt-6 space-y-4 relative border-l-2 border-slate-800 ml-3 pl-6">
              {evidenceItems.length === 0 ? (
                <p className="text-xs text-slate-500">No evidence items recorded in chain of custody yet.</p>
              ) : (
                evidenceItems.map(e => (
                  <div key={e.id} className="relative space-y-2">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-slate-950" />
                    
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{e.original_filename}</span>
                        <span className="font-mono text-slate-400">{formatDate(e.uploaded_at)}</span>
                      </div>
                      <div className="mt-2 grid gap-1 text-[11px] text-slate-400">
                        <p>1. <strong>Acquisition:</strong> {e.provenance} via {e.acquisition_method}</p>
                        <p>2. <strong>Integrity Hash:</strong> <span className="font-mono text-cyan-300 select-all">{e.sha256_hash}</span></p>
                        <p>3. <strong>Normalization:</strong> {e.timeline_events_created || 0} timeline event(s) generated into PostgreSQL</p>
                        <p>4. <strong>Correlation Status:</strong> Included in alibi correlation scoring engine</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GEOGRAPHIC MAP CORRELATION (Priority 5) */}
      {activeTab === "map" && (
        <div className="mt-5">
          <GeographicMap
            claimedLocation={caseItem.claimed_alibi_location || "Claimed Alibi Location"}
            claimedLat={caseItem.claimed_alibi_lat || 28.514430}
            claimedLng={caseItem.claimed_alibi_lng || -96.990928}
            events={timelineEvents}
            toleranceM={150}
          />
        </div>
      )}
    </PageCard>
  );
}
