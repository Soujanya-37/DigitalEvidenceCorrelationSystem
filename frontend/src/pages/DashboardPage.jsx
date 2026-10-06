import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderPlus, 
  UploadCloud, 
  Clock, 
  BrainCircuit, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Database, 
  FileSearch, 
  RefreshCw,
  Compass
} from 'lucide-react';
import { getCases } from '../services/caseService';
import { getCaseEvidence } from '../services/evidenceService';
import { getAnalysis } from '../services/analysisService';

export default function DashboardPage() {
  const [cases, setCases] = useState([]);
  const [caseMetrics, setCaseMetrics] = useState({
    totalEvidence: 0,
    totalEvents: 0,
    supportedCount: 0,
    contradictedCount: 0,
    inconclusiveCount: 0,
    recentEvidence: [],
    analysisMap: {},
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const fetchedCases = await getCases();
      const caseList = Array.isArray(fetchedCases) ? fetchedCases : [];
      setCases(caseList);

      let totalEv = 0;
      let totalEvts = 0;
      let sup = 0;
      let con = 0;
      let inc = 0;
      const allEvidence = [];
      const analysisMap = {};

      for (const c of caseList) {
        try {
          const evItems = await getCaseEvidence(c.id);
          totalEv += (evItems || []).length;
          evItems.forEach(e => {
            totalEvts += (e.timeline_events_created || 0);
            allEvidence.push({ ...e, case_title: c.title, case_number: c.case_number });
          });
        } catch {
          // ignore
        }

        try {
          const res = await getAnalysis(c.id);
          if (res) {
            analysisMap[c.id] = res;
            const v = String(res.verdict || '').toLowerCase();
            if (v === 'supported') sup++;
            else if (v === 'contradicted') con++;
            else if (v === 'inconclusive') inc++;
          }
        } catch {
          // ignore
        }
      }

      setCaseMetrics({
        totalEvidence: totalEv,
        totalEvents: totalEvts,
        supportedCount: sup,
        contradictedCount: con,
        inconclusiveCount: inc,
        recentEvidence: allEvidence.slice(0, 5),
        analysisMap,
      });
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalVerified = caseMetrics.supportedCount + caseMetrics.contradictedCount + caseMetrics.inconclusiveCount;

  return (
    <div className="space-y-6">
      {/* Streamlined Executive Command Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Investigative Overview
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Automated multi-source evidence correlation, timeline reconstruction, and deterministic alibi verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <Link
              to="/create-case"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition"
            >
              <FolderPlus size={14} /> Open Case
            </Link>
          </div>
        </div>

        {/* Clean Process Flow Indicator */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/60 pt-4 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] mr-1">Forensic Pipeline:</span>
          <Link to="/create-case" className="hover:text-cyan-300 transition">1. Case Setup</Link>
          <span className="text-slate-600">→</span>
          <Link to="/upload-evidence" className="hover:text-cyan-300 transition">2. Evidence Ingestion</Link>
          <span className="text-slate-600">→</span>
          <Link to="/timeline" className="hover:text-cyan-300 transition">3. Timeline Reconstruction</Link>
          <span className="text-slate-600">→</span>
          <Link to="/ai-analysis" className="hover:text-cyan-300 transition">4. Alibi Correlation</Link>
          <span className="text-slate-600">→</span>
          <Link to="/reports" className="hover:text-cyan-300 transition">5. Case Report</Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Cases</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400"><FileSearch size={16} /></div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-white">{loading ? '...' : cases.length}</p>
          <p className="mt-1 text-xs text-slate-500">Documented in database</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Evidence Assets</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400"><Database size={16} /></div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-white">{loading ? '...' : caseMetrics.totalEvidence}</p>
          <p className="mt-1 text-xs text-slate-500">SHA-256 integrity verified</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Timeline Events</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400"><Clock size={16} /></div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-white">{loading ? '...' : caseMetrics.totalEvents}</p>
          <p className="mt-1 text-xs text-slate-500">Normalized timestamps</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Alibis</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400"><BrainCircuit size={16} /></div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-white">{loading ? '...' : totalVerified}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{caseMetrics.supportedCount} Valid</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{caseMetrics.contradictedCount} Conflicted</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{caseMetrics.inconclusiveCount} Inconcl.</span>
          </div>
        </div>
      </div>

      {/* Main Casework Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        
        {/* Active Investigations */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">Active Investigations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Track alibi claims and current verification results</p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              View all ({cases.length}) →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {cases.length === 0 ? (
              <div className="rounded-xl border border-slate-800/60 p-8 text-center">
                <FileSearch className="mx-auto text-slate-600 mb-2" size={28} />
                <p className="text-sm font-medium text-slate-300">No active cases</p>
                <p className="text-xs text-slate-500 mt-1">Open a new investigation to start correlating evidence.</p>
                <Link to="/create-case" className="mt-3 inline-block rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950">
                  Open Case
                </Link>
              </div>
            ) : (
              cases.slice(0, 5).map(c => {
                const analysis = caseMetrics.analysisMap[c.id];
                const verdict = analysis ? String(analysis.verdict).toLowerCase() : null;

                return (
                  <div key={c.id} className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 hover:border-slate-700 transition">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-cyan-400 font-semibold">{c.case_number}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-sm font-semibold text-white">{c.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Suspect: <span className="text-slate-200">{c.suspect_name}</span></p>
                      </div>

                      {/* Verdict Badge */}
                      <div>
                        {verdict === 'supported' && (
                          <span className="badge-supported inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            <CheckCircle2 size={12} /> SUPPORTED ({analysis.confidence_score}%)
                          </span>
                        )}
                        {verdict === 'contradicted' && (
                          <span className="badge-contradicted inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            <XCircle size={12} /> CONTRADICTED ({analysis.confidence_score}%)
                          </span>
                        )}
                        {verdict === 'inconclusive' && (
                          <span className="badge-inconclusive inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            <AlertTriangle size={12} /> INCONCLUSIVE ({analysis.confidence_score}%)
                          </span>
                        )}
                        {!verdict && (
                          <span className="badge-neutral rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                            PENDING ANALYSIS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Claim Details */}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 rounded-lg bg-slate-900/60 p-2.5 text-xs border border-slate-800/60">
                      <div>
                        <span className="text-slate-500">Claimed Location:</span>
                        <p className="text-slate-300 truncate font-medium">{c.claimed_alibi_location || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Alibi Window:</span>
                        <p className="font-mono text-slate-300 truncate">
                          {c.claimed_alibi_start ? new Date(c.claimed_alibi_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'} → {c.claimed_alibi_end ? new Date(c.claimed_alibi_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs">
                      <span className="text-[11px] text-slate-500">Priority: <span className="text-slate-300 font-medium">{c.priority}</span></span>
                      <div className="flex items-center gap-3">
                        <Link to={`/cases/${c.id}`} className="text-slate-400 hover:text-white transition">
                          Dossier
                        </Link>
                        <Link to={`/timeline?case_id=${c.id}`} className="text-cyan-400 hover:text-cyan-300 transition">
                          Timeline →
                        </Link>
                        <Link to={`/ai-analysis?case_id=${c.id}`} className="text-emerald-400 hover:text-emerald-300 transition font-medium">
                          Correlate →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ingestion Stream & Reference */}
        <div className="space-y-6">
          {/* Recent Ingested Files */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="font-bold text-white text-base">Evidence Stream</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recently ingested forensic assets</p>
              </div>
              <Link to="/upload-evidence" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                + Ingest
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {caseMetrics.recentEvidence.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No evidence ingested yet.</p>
              ) : (
                caseMetrics.recentEvidence.map(item => (
                  <div key={item.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white truncate max-w-[170px]">{item.original_filename}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                        {item.evidence_type}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-slate-500 truncate">
                      SHA-256: {item.sha256_hash ? `${item.sha256_hash.slice(0, 18)}...` : 'pending'}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Events: <strong className="text-emerald-400">{item.timeline_events_created || 0}</strong></span>
                      <span className="text-slate-500">{item.case_number}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Standards / Methodology Note */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
            <h4 className="font-semibold text-slate-300 text-xs flex items-center gap-2">
              <Compass size={14} className="text-cyan-400" /> Correlation Parameters
            </h4>
            <div className="mt-3 space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-300">150m Haversine Radius:</strong> Coordinates within 150m of the claimed location are classified as supporting matches.
              </p>
              <p>
                <strong className="text-slate-300">Temporal Windowing:</strong> Out-of-window events remain neutral, avoiding false contradictions.
              </p>
              <p>
                <strong className="text-slate-300">Chain of Custody:</strong> Every uploaded artifact is sealed with a non-invertible SHA-256 checksum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
