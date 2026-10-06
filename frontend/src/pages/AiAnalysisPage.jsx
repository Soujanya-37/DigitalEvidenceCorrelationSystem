import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  BrainCircuit, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  Info, 
  Layers, 
  RefreshCw,
  Cpu,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import PageCard from '../components/PageCard';
import GeographicMap from '../components/GeographicMap';
import { getCases, getCaseById } from '../services/caseService';
import { getAnalysis, runAnalysis } from '../services/analysisService';
import { getTimeline } from '../services/timelineService';

const verdictStyle = {
  supported: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  contradicted: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  inconclusive: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
};

const statusStyle = {
  matched: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300',
  conflicting: 'bg-rose-950/80 border-rose-500/30 text-rose-300',
  neutral: 'bg-slate-900 border-slate-700 text-slate-400',
};

export default function AiAnalysisPage() {
  const [params, setParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(params.get('case_id') || '');
  const [currentCase, setCurrentCase] = useState(null);
  const [result, setResult] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCases()
      .then(d => {
        setCases(d);
        if (!caseId && d[0]) {
          setCaseId(d[0].id);
          setParams({ case_id: d[0].id });
        }
      })
      .catch(e => setError(e.response?.data?.detail || 'Unable to load cases.'));
  }, []);

  useEffect(() => {
    if (!caseId) return;

    getCaseById(caseId).then(setCurrentCase).catch(() => {});
    getTimeline(caseId).then(setTimelineEvents).catch(() => []);
    getAnalysis(caseId)
      .then(setResult)
      .catch(() => setResult(null));
  }, [caseId]);

  const run = async () => {
    if (!caseId) return;
    setLoading(true);
    setError('');
    try {
      const res = await runAnalysis(caseId);
      setResult(res);
      const tEvents = await getTimeline(caseId).catch(() => []);
      setTimelineEvents(tEvents);
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis engine execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const verdict = result ? String(result.verdict).toLowerCase() : null;
  const summary = result?.analysis_summary || {};
  const eventResults = summary.event_results || [];

  // Identify any conflicting events for priority contradiction detection (Priority 7)
  const conflictingEvents = useMemo(() => {
    return eventResults.filter(e => e.status === 'conflicting');
  }, [eventResults]);

  return (
    <PageCard
      title="Alibi Correlation & Verification Engine"
      description="Explainable multi-source evidence correlation applying Haversine geographical distance, time-window overlap, and source weighting."
    >
      {/* Case Selector Bar */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 min-w-[260px]">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Investigation Case</label>
            <select
              value={caseId}
              onChange={e => {
                setCaseId(e.target.value);
                setParams({ case_id: e.target.value });
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-white"
            >
              <option value="">Select an investigation</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.suspect_name} ({c.title})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={run}
              disabled={loading || !caseId}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition disabled:opacity-40"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              {loading ? 'Correlating Evidence…' : 'Execute Correlation'}
            </button>
            <Link
              to={`/reports?case_id=${caseId}`}
              className="rounded-lg border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              Export Report
            </Link>
          </div>
        </div>

        {/* Claimed Alibi Snapshot */}
        {currentCase && (
          <div className="mt-4 grid gap-2 sm:grid-cols-3 rounded-xl bg-slate-900/60 p-3 text-xs border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Claimed Location:</span>
              <span className="font-bold text-white">{currentCase.claimed_alibi_location || 'Not provided'}</span>
              {currentCase.claimed_alibi_lat != null && (
                <span className="block font-mono text-[10px] text-slate-400">
                  {currentCase.claimed_alibi_lat}, {currentCase.claimed_alibi_lng}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Claimed Alibi Window:</span>
              <span className="font-mono text-cyan-300">
                {currentCase.claimed_alibi_start ? new Date(currentCase.claimed_alibi_start).toLocaleString() : '—'}
                <br />
                ↓ {currentCase.claimed_alibi_end ? new Date(currentCase.claimed_alibi_end).toLocaleString() : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Subject Statement:</span>
              <span className="text-slate-300 italic line-clamp-2">
                "{currentCase.claimed_alibi_text || 'No statement'}"
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">{error}</div>}

      {/* Main Analysis Display */}
      {result ? (
        <div className="mt-6 space-y-6">
          
          {/* SECTION: CONTRADICTION DETECTION ALERTS (Priority 7) */}
          {conflictingEvents.length > 0 && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} /> ⚠ CONTRADICTORY EVIDENCE DETECTED DURING CLAIMED ALIBI WINDOW
              </div>
              <p className="mt-1 text-xs text-slate-300">
                The correlation engine identified {conflictingEvents.length} piece(s) of digital evidence placing the subject outside the 150m tolerance boundary while the alibi was active:
              </p>

              <div className="mt-3 space-y-2">
                {conflictingEvents.map((c, i) => (
                  <div key={c.event_id || i} className="rounded-xl border border-rose-500/30 bg-slate-950/80 p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-white">{new Date(c.timestamp).toLocaleTimeString()}</span>
                      <span className="ml-2 font-mono text-[10px] text-rose-300 uppercase bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                        {c.source}
                      </span>
                      <p className="mt-1 text-slate-300">
                        Evidence Location: <strong>{c.location || 'Unknown Coordinates'}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-400 text-xs">{c.reason}</span>
                      {c.ml_support_probability != null && (
                        <p className="text-[10px] text-slate-400">ML support: {c.ml_support_probability}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: VERDICT & SCORE GAUGES */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Card */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                  <span className="flex items-center gap-1.5 font-medium"><Gauge size={14} className="text-cyan-400" /> ALIBI CONSISTENCY SCORE</span>
                  <span className="font-mono text-[10px] text-slate-400">EXPLAINABLE FORMULA</span>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-5xl font-extrabold font-mono text-white tracking-tight">
                    {result.confidence_score}%
                  </span>
                  <p className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-medium">
                    Digital Evidence Consistency
                  </p>

                  {/* Progress Meter */}
                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        verdict === 'supported' 
                          ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' 
                          : verdict === 'contradicted' 
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500' 
                          : 'bg-gradient-to-r from-amber-400 to-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, result.confidence_score))}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0% Contradicted</span>
                    <span>40% Threshold</span>
                    <span>80% Supported</span>
                    <span>100% Consistent</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-slate-950/40 p-3 text-xs border border-slate-800/80 space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Matched Events:</span>
                  <span className="font-semibold text-emerald-400">{result.matched_events_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Conflicting Events:</span>
                  <span className="font-semibold text-rose-400">{result.conflicting_events_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Neutral Events (Outside Window):</span>
                  <span className="font-semibold text-slate-300">{summary.neutral_events || 0}</span>
                </div>
              </div>
            </div>

            {/* Verdict Card */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                  <span className="flex items-center gap-1.5 font-medium"><BrainCircuit size={14} className="text-cyan-400" /> FORENSIC VERDICT</span>
                  <span className="font-mono text-[10px] text-slate-500">HAVERSINE ≤ 150M</span>
                </div>

                <div className="mt-6">
                  <div className={`rounded-2xl border p-5 text-center ${verdictStyle[verdict] || verdictStyle.inconclusive}`}>
                    <div className="flex items-center justify-center gap-2 font-extrabold text-2xl tracking-wide">
                      {verdict === 'supported' && <CheckCircle2 size={24} />}
                      {verdict === 'contradicted' && <XCircle size={24} />}
                      {verdict === 'inconclusive' && <AlertTriangle size={24} />}
                      {result.verdict?.toUpperCase()}
                    </div>
                    <p className="mt-2 text-xs opacity-90 max-w-sm mx-auto leading-relaxed">
                      {verdict === 'supported' && 'Available digital evidence strongly confirms the subject was within the claimed location boundary during the stated time window.'}
                      {verdict === 'contradicted' && 'Sufficient timestamped evidence places the subject at an incompatible location during the claimed alibi window.'}
                      {verdict === 'inconclusive' && 'Mixed signals, partial location coverage, or lack of evidence within the claimed window prevents conclusive determination.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Legal Disclaimer */}
              <div className="mt-6 rounded-xl border border-cyan-800/30 bg-cyan-950/20 p-3 text-[11px] text-cyan-300">
                <strong>Forensic Standard:</strong> Consistency score represents mathematical agreement with the claimed alibi under configured weights. It is not an absolute legal determination of guilt or innocence.
              </div>
            </div>
          </div>

          {/* SECTION: EXPLAINABLE CORRELATION */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Compass size={16} className="text-cyan-400" /> Explainable Correlation Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic algorithmic derivation for investigative defensibility and audit reporting.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Formula</span>
                <p className="mt-1 font-mono text-sm text-white font-bold">
                  Score = (W_Match / W_Rel) × 100
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Weights: GPS (1.0), CCTV (1.0), Photos (0.9), Bank (0.8), Phone (0.75).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Spatial Distance Tolerance</span>
                <p className="mt-1 font-mono text-sm text-white font-bold">
                  {summary.gps_tolerance_m || 150} Meters (Haversine)
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Evidence GPS points within 150m of claimed location are verified as MATCH.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Temporal Boundary</span>
                <p className="mt-1 font-mono text-sm text-white font-bold">
                  Alibi Time Window Overlap
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Events outside the window are classified Neutral (No evidence ≠ contradiction).
                </p>
              </div>
            </div>

            {/* Source Weights & Contributions Breakdown (Priority 8) */}
            <div className="mt-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multi-Source Modality Breakdown</span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(summary.sources || {}).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
                    <span className="font-bold text-white uppercase">{k}</span>
                    <div className="mt-2 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Events:</span>
                        <span>{v.total}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Matched:</span>
                        <span>{v.matched}</span>
                      </div>
                      <div className="flex justify-between text-rose-400 font-bold">
                        <span>Conflicting:</span>
                        <span>{v.conflicting}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Neutral:</span>
                        <span>{v.neutral}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION: GEOGRAPHIC INVESTIGATION MAP (Priority 5) */}
          <GeographicMap
            claimedLocation={currentCase?.claimed_alibi_location || 'Claimed Alibi Location'}
            claimedLat={currentCase?.claimed_alibi_lat || 28.514430}
            claimedLng={currentCase?.claimed_alibi_lng || -96.990928}
            events={timelineEvents}
            toleranceM={summary.gps_tolerance_m || 150}
          />

          {/* SECTION: MACHINE LEARNING VS DETERMINISTIC LAYER (Priority 35 & 59) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-cyan-400" />
                <h3 className="font-bold text-white text-base">Machine Learning Decision Support Layer</h3>
              </div>
              <span className="rounded bg-cyan-950 border border-cyan-800/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                SCIKIT-LEARN RANDOM FOREST
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              In addition to the deterministic correlation engine, an assistive <strong>Random Forest Classifier</strong> evaluates feature vectors (source modality, time-window overlap, coordinate availability, and Haversine distance).
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2">
              <p className="text-slate-400">
                <strong>Academic Viva Defense:</strong> "The current Random Forest model is a prototype decision-support layer trained on calibration data. The deterministic correlation engine remains the primary basis for the verification verdict. In forensic applications, deterministic explainability is paramount."
              </p>
            </div>
          </div>

          {/* SECTION: EVENT-LEVEL CORRELATION AUDIT TABLE */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" /> Event-Level Correlation Audit Log
            </h3>
            <p className="text-xs text-slate-400 mt-1">Detailed evaluation of each ingested evidence event against the claimed alibi.</p>

            <div className="mt-4 space-y-2">
              {eventResults.map((e, idx) => (
                <div 
                  key={e.event_id || idx}
                  className="grid gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 text-xs sm:grid-cols-[1.2fr_0.8fr_1fr_1.4fr]"
                >
                  <span className="font-mono text-slate-300">{new Date(e.timestamp).toLocaleString()}</span>
                  <span className="uppercase font-bold text-cyan-300">{e.source}</span>
                  <span className="text-slate-400 flex items-center gap-1 truncate">
                    <MapPin size={11} className="text-cyan-400 shrink-0" /> {e.location || 'No location fix'}
                  </span>
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] border ${statusStyle[e.status] || statusStyle.neutral}`}>
                      {e.status.toUpperCase()}
                    </span>
                    <span className="ml-2 text-slate-300">{e.reason}</span>
                    {e.ml_support_probability != null && (
                      <span className="block font-mono text-[10px] text-cyan-400 mt-0.5">
                        ML Probability: {e.ml_support_probability}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-12 text-center">
          <BrainCircuit size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white text-base">No Correlation Analysis Generated Yet</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Click "Execute Correlation Engine" to process the case's ingested evidence files, calculate Haversine distances, and compute the consistency score.
          </p>
          <button
            onClick={run}
            disabled={!caseId || loading}
            className="mt-5 rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-lg disabled:opacity-40"
          >
            {loading ? 'Correlating Evidence…' : 'Execute Correlation Engine Now'}
          </button>
        </div>
      )}
    </PageCard>
  );
}
