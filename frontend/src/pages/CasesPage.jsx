import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderSearch, 
  RefreshCw, 
  Download, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Search
} from 'lucide-react';
import PageCard from '../components/PageCard';
import { getCases } from '../services/caseService';
import { getAnalysis } from '../services/analysisService';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [analysisMap, setAnalysisMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const loadCases = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCases();
      const list = Array.isArray(data) ? data : [];
      setCases(list);

      // Load analysis for each case
      const map = {};
      for (const c of list) {
        try {
          const res = await getAnalysis(c.id);
          if (res) map[c.id] = res;
        } catch {
          // No analysis yet
        }
      }
      setAnalysisMap(map);
    } catch (err) {
      console.error('Failed to load cases:', err);
      setError(err.response?.data?.detail || 'Unable to retrieve cases. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter(item => {
      const matchesSearch = 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.suspect_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.case_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.claimed_alibi_location || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = priorityFilter === 'ALL' || String(item.priority).toUpperCase() === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [cases, searchQuery, priorityFilter]);

  const exportSummary = () => {
    if (cases.length === 0) return;

    const headers = ['Case Number', 'Title', 'Suspect', 'Priority', 'Claimed Location', 'Alibi Start', 'Alibi End', 'Verdict', 'Confidence'];
    const rows = cases.map(c => {
      const a = analysisMap[c.id];
      return [
        c.case_number || '',
        c.title || '',
        c.suspect_name || '',
        c.priority || '',
        c.claimed_alibi_location || '',
        c.claimed_alibi_start || '',
        c.claimed_alibi_end || '',
        a ? a.verdict : 'Pending',
        a ? `${a.confidence_score}%` : 'N/A',
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageCard
      title="Investigation Case Inventory"
      description="Repository of active and archived investigations with subject alibi parameters and correlation states."
    >
      {/* Search and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 sm:p-4 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by case title, suspect, or location..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={loadCases}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={exportSummary}
            disabled={cases.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <Download size={13} /> Export CSV
          </button>

          <Link
            to="/create-case"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition"
          >
            <PlusCircle size={14} /> New Case
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Case List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="rounded-xl border border-slate-800/80 p-8 text-center text-xs text-slate-400">
            <RefreshCw size={18} className="mx-auto animate-spin text-cyan-400 mb-2" />
            Loading cases...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="rounded-xl border border-slate-800/80 p-10 text-center">
            <FolderSearch size={32} className="mx-auto text-slate-600 mb-3" />
            <h4 className="text-sm font-semibold text-white">No investigations found</h4>
            <p className="mt-1 text-xs text-slate-500">No cases match your current filter criteria.</p>
          </div>
        ) : (
          filteredCases.map(item => {
            const analysis = analysisMap[item.id];
            const verdict = analysis ? String(analysis.verdict).toLowerCase() : null;

            return (
              <div 
                key={item.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 hover:border-slate-700/80 transition"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cyan-400">{item.case_number}</span>
                      <span className="text-slate-600">•</span>
                      <h3 className="font-semibold text-sm sm:text-base text-white">{item.title}</h3>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Subject: <span className="text-slate-200 font-medium">{item.suspect_name}</span> • Priority:{' '}
                      <span className="text-slate-300 font-medium">{item.priority}</span>
                    </p>
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
                        PENDING CORRELATION
                      </span>
                    )}
                  </div>
                </div>

                {/* Alibi Target Block */}
                <div className="mt-3 grid gap-2 sm:grid-cols-2 rounded-lg bg-slate-950/40 p-3 border border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <MapPin size={11} className="text-cyan-400" /> Claimed Location
                    </span>
                    <p className="mt-0.5 font-medium text-slate-300">
                      {item.claimed_alibi_location || 'Not specified'}
                      {item.claimed_alibi_lat != null && (
                        <span className="block font-mono text-[10px] text-slate-500">
                          {item.claimed_alibi_lat}, {item.claimed_alibi_lng}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Clock size={11} className="text-cyan-400" /> Claimed Time Window
                    </span>
                    <p className="mt-0.5 font-mono text-slate-300 text-[11px]">
                      {item.claimed_alibi_start ? new Date(item.claimed_alibi_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      {' '}→{' '}
                      {item.claimed_alibi_end ? new Date(item.claimed_alibi_end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </p>
                  </div>
                </div>

                {/* Action Links */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Link to={`/timeline?case_id=${item.id}`} className="hover:text-cyan-400 transition">
                      Timeline
                    </Link>
                    <span>•</span>
                    <Link to={`/ai-analysis?case_id=${item.id}`} className="hover:text-emerald-400 transition">
                      Correlate Alibi
                    </Link>
                    <span>•</span>
                    <Link to={`/reports?case_id=${item.id}`} className="hover:text-slate-200 transition">
                      Report
                    </Link>
                  </div>

                  <Link
                    to={`/cases/${item.id}`}
                    className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Open Dossier <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageCard>
  );
}