import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Printer,
  Compass,
  Hash,
  Database,
  Calendar,
  User,
  MapPin,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import PageCard from "../components/PageCard";
import { getCases, getCaseById } from "../services/caseService";
import { getCaseEvidence } from "../services/evidenceService";
import { getAnalysis } from "../services/analysisService";
import { downloadReport } from "../services/reportService";

export default function ReportsPage() {
  const [params, setParams] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(params.get("case_id") || "");
  const [currentCase, setCurrentCase] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCases().then((data) => {
      setCases(data);
      if (!caseId && data[0]) {
        setCaseId(data[0].id);
        setParams({ case_id: data[0].id });
      }
    });
  }, []);

  useEffect(() => {
    if (!caseId) {
      setCurrentCase(null);
      setEvidenceItems([]);
      setAnalysis(null);
      return;
    }

    setLoading(true);

    Promise.all([
      getCaseById(caseId).catch(() => null),
      getCaseEvidence(caseId).catch(() => []),
      getAnalysis(caseId).catch(() => null),
    ])
      .then(([cData, evData, anData]) => {
        setCurrentCase(cData);
        setEvidenceItems(evData);
        setAnalysis(anData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [caseId]);

  const score = analysis?.confidence_score != null ? Number(analysis.confidence_score) : null;
  const verdict = String(analysis?.verdict || "inconclusive").toLowerCase();
  const summary = analysis?.analysis_summary || {};
  const matched = analysis?.matched_events_count ?? 0;
  const conflicting = analysis?.conflicting_events_count ?? 0;
  const neutral = summary.neutral_events ?? 0;
  const totalEvents = matched + conflicting + neutral;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageCard
      title="Investigation Summary Reports"
      description="Concise, forensically structured alibi verification report and decision support documentation."
    >
      {/* Case Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 mb-5">
        <div className="w-full sm:w-auto flex-1 min-w-[260px]">
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Investigation</label>
          <select
            value={caseId}
            onChange={(e) => {
              setCaseId(e.target.value);
              setParams(e.target.value ? { case_id: e.target.value } : {});
            }}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white"
          >
            <option value="">Select a case...</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} — {c.suspect_name} ({c.title})
              </option>
            ))}
          </select>
        </div>

        {caseId && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <Printer size={14} /> Print
            </button>
            <button
              disabled={!caseId}
              onClick={() => downloadReport(caseId)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition disabled:opacity-40"
            >
              <Download size={14} /> Export Report
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-5 rounded-xl border border-slate-800/80 p-8 text-center text-xs text-slate-500">
          Compiling investigation report from PostgreSQL database...
        </div>
      )}

      {/* FORMAL FORENSIC REPORT DOCUMENT (Printable) */}
      {caseId && !loading && currentCase && (
        <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-900/30 p-6 sm:p-8 space-y-6 print-clean">
          
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-cyan-400 block">
                  DIGITAL FORENSICS INVESTIGATION REPORT
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">
                  Alibi Verification & Cross-Evidence Correlation Summary
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Automated Correlation Engine • Digital Forensics Laboratory
                </p>
              </div>

              <div className="text-right text-xs space-y-1 font-mono">
                <p className="text-slate-400">Report Date: <strong className="text-white">{new Date().toLocaleDateString()}</strong></p>
                <p className="text-slate-400">Case ID: <strong className="text-cyan-300">{currentCase.case_number}</strong></p>
                <p className="text-slate-500 text-[10px]">Classification: LAW ENFORCEMENT & FORENSIC RESEARCH</p>
              </div>
            </div>
          </div>

          {/* Section 1: Case Particulars */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <User size={14} /> 1. Investigation & Subject Particulars
            </h3>
            <div className="grid gap-3 sm:grid-cols-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Case Title:</span>
                <span className="font-bold text-white">{currentCase.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Suspect / Subject:</span>
                <span className="font-bold text-white">{currentCase.suspect_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Priority Level:</span>
                <span className="font-semibold text-cyan-300">{currentCase.priority}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Database Status:</span>
                <span className="font-semibold text-emerald-400">{currentCase.status?.toUpperCase() || 'ACTIVE'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Alibi Claim */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <Compass size={14} /> 2. Claimed Subject Alibi (Verification Target)
            </h3>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Claimed Location:</span>
                  <span className="font-semibold text-white">{currentCase.claimed_alibi_location || 'Not provided'}</span>
                  {currentCase.claimed_alibi_lat != null && (
                    <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                      Coordinates: {currentCase.claimed_alibi_lat}, {currentCase.claimed_alibi_lng}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Claimed Alibi Window:</span>
                  <span className="font-mono text-cyan-300">
                    {currentCase.claimed_alibi_start ? new Date(currentCase.claimed_alibi_start).toLocaleString() : '—'} → {currentCase.claimed_alibi_end ? new Date(currentCase.claimed_alibi_end).toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="text-slate-500 block text-[10px]">Formal Alibi Statement:</span>
                <p className="mt-1 text-slate-200 italic leading-relaxed">
                  "{currentCase.claimed_alibi_text || currentCase.description || 'No formal narrative recorded.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Correlation Methodology */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <ShieldCheck size={14} /> 3. Algorithmic Verification Methodology
            </h3>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2 text-slate-300 leading-relaxed">
              <p>
                <strong>1. Temporal Window Filtering:</strong> All evidence events are compared against the claimed start and end timestamps. Evidence falling outside the claimed time is classified as <em>Neutral</em> (it neither confirms nor contradicts the alibi).
              </p>
              <p>
                <strong>2. Haversine Geographic Distance Correlation:</strong> For telemetry with latitude/longitude (GPS, EXIF, GeoLife), great-circle distance to the claimed location is calculated. Evidence within the <strong>150-meter tolerance threshold</strong> is confirmed as a match.
              </p>
              <p>
                <strong>3. Modality Weighting:</strong> Evidence sources are weighted according to forensic confidence: GPS (1.0), CCTV (1.0), Photos (0.9), Device Logs (0.85), ATM/Banking (0.8), CDR (0.75).
              </p>
            </div>
          </div>

          {/* Section 4: Verification Result & Findings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <BrainCircuit size={14} /> 4. Correlation Findings & Verification Verdict
            </h3>

            {analysis ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-3 text-center">
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Evidence Consistency Score</span>
                    <p className="mt-1 font-mono text-4xl font-extrabold text-white">{analysis.confidence_score}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex flex-col justify-center items-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Verification Verdict</span>
                    <div className="mt-1 font-bold text-lg">
                      {verdict === 'supported' && <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={16} /> SUPPORTED</span>}
                      {verdict === 'contradicted' && <span className="text-rose-400 flex items-center gap-1.5"><XCircle size={16} /> CONTRADICTED</span>}
                      {verdict === 'inconclusive' && <span className="text-amber-400 flex items-center gap-1.5"><AlertTriangle size={16} /> INCONCLUSIVE</span>}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-left text-xs space-y-1">
                    <div className="flex justify-between"><span>Supporting Events:</span> <strong className="text-emerald-400">{matched}</strong></div>
                    <div className="flex justify-between"><span>Conflicting Events:</span> <strong className="text-rose-400">{conflicting}</strong></div>
                    <div className="flex justify-between"><span>Neutral Events:</span> <strong className="text-slate-400">{neutral}</strong></div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs text-slate-300">
                  <strong>Investigative Conclusion:</strong>{' '}
                  {verdict === 'supported' && 'The supplied digital evidence is highly consistent with the claimed alibi according to configured correlation rules and 150m Haversine distance.'}
                  {verdict === 'contradicted' && 'Timestamped digital evidence conflicts with the claimed location during the stated alibi period, indicating the subject was at an incompatible location.'}
                  {verdict === 'inconclusive' && 'There is insufficient relevant evidence within the active window to definitively support or contradict the claim. (No evidence ≠ contradiction).'}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 p-6 text-center text-xs text-slate-400">
                Correlation analysis has not yet been executed for this case.{' '}
                <Link to={`/ai-analysis?case_id=${caseId}`} className="text-cyan-400 underline font-semibold">
                  Execute Correlation Engine →
                </Link>
              </div>
            )}
          </div>

          {/* Section 5: Evidence Inventory & SHA-256 Hashes (Priority 1 & 36) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-3">
              <Hash size={14} /> 5. Ingested Evidence Inventory & Cryptographic Hashes
            </h3>

            {evidenceItems.length === 0 ? (
              <p className="text-xs text-slate-500">No evidence artifacts recorded for this investigation.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Filename</th>
                      <th className="px-4 py-2.5">Modality</th>
                      <th className="px-4 py-2.5">Provenance</th>
                      <th className="px-4 py-2.5">SHA-256 Checksum (Integrity)</th>
                      <th className="px-4 py-2.5 text-right">Events</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {evidenceItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-2.5 font-semibold text-white truncate max-w-[160px]">{item.original_filename}</td>
                        <td className="px-4 py-2.5 uppercase font-mono text-[10px] text-cyan-300">{item.evidence_type}</td>
                        <td className="px-4 py-2.5 text-slate-400">{item.provenance}</td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400 break-all select-all">{item.sha256_hash}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-400">{item.timeline_events_created || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Document Footer & Sign-off */}
          <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              <p>Generated by: <strong>Digital Evidence Correlation Platform (FastAPI + PostgreSQL)</strong></p>
              <p>Mathematical Basis: 150m Haversine Formula & Modality Weights</p>
            </div>
            <div className="text-right">
              <p className="border-b border-slate-700 pb-1 w-48 inline-block text-center text-slate-300">Investigator Signature / Auth Key</p>
              <p className="mt-1">Forensic Decision Support Only</p>
            </div>
          </div>

        </div>
      )}
    </PageCard>
  );
}