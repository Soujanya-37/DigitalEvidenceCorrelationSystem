import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Filter, 
  Search, 
  Calendar, 
  Database, 
  Camera, 
  Video, 
  CreditCard, 
  Smartphone, 
  FileText,
  Eye,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import PageCard from '../components/PageCard';
import GeographicMap from '../components/GeographicMap';
import { getCases, getCaseById } from '../services/caseService';
import { getTimeline } from '../services/timelineService';
import { getAnalysis } from '../services/analysisService';

export default function TimelinePage() {
  const [params, setParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(params.get('case_id') || '');
  const [currentCase, setCurrentCase] = useState(null);
  const [events, setEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [windowFilter, setWindowFilter] = useState('ALL'); // ALL, INSIDE, OUTSIDE
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('visual'); // visual, table, map
  const [selectedEvent, setSelectedEvent] = useState(null);

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

    setLoading(true);
    setError('');

    Promise.all([
      getCaseById(caseId).catch(() => null),
      getTimeline(caseId).catch(() => []),
      getAnalysis(caseId).catch(() => null),
    ])
      .then(([cData, tEvents, anData]) => {
        setCurrentCase(cData);
        setEvents(tEvents);
        setAnalysis(anData);
      })
      .catch(e => setError(e.response?.data?.detail || 'Unable to load timeline.'))
      .finally(() => setLoading(false));
  }, [caseId]);

  // Determine if an event is inside the alibi window
  const enrichedEvents = useMemo(() => {
    if (!currentCase) return events;

    const alibiStart = currentCase.claimed_alibi_start ? new Date(currentCase.claimed_alibi_start) : null;
    const alibiEnd = currentCase.claimed_alibi_end ? new Date(currentCase.claimed_alibi_end) : null;
    const claimedLat = currentCase.claimed_alibi_lat;
    const claimedLng = currentCase.claimed_alibi_lng;

    return events.map(e => {
      const ts = new Date(e.event_timestamp);
      const inWindow = Boolean(alibiStart && alibiEnd && ts >= alibiStart && ts <= alibiEnd);

      // Distance calculation if coordinates available
      let distanceM = null;
      let isDistanceMatch = null;

      if (claimedLat != null && claimedLng != null && e.location_lat != null && e.location_lng != null) {
        const dLat = (e.location_lat - claimedLat) * 111320;
        const dLng = (e.location_lng - claimedLng) * (40075000 * Math.cos((claimedLat * Math.PI) / 180) / 360);
        distanceM = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
        isDistanceMatch = distanceM <= 150;
      }

      return {
        ...e,
        inWindow,
        distanceM,
        isDistanceMatch,
      };
    });
  }, [events, currentCase]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return enrichedEvents.filter(e => {
      const matchesSource = sourceFilter === 'ALL' || String(e.source_type).toLowerCase() === sourceFilter.toLowerCase();
      const matchesWindow = 
        windowFilter === 'ALL' || 
        (windowFilter === 'INSIDE' && e.inWindow) || 
        (windowFilter === 'OUTSIDE' && !e.inWindow);

      const matchesSearch = 
        (e.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.location_label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.source_type || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSource && matchesWindow && matchesSearch;
    });
  }, [enrichedEvents, sourceFilter, windowFilter, searchQuery]);

  const getSourceIcon = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes('cctv') || t.includes('video')) return Video;
    if (t.includes('image') || t.includes('photo')) return Camera;
    if (t.includes('gps')) return MapPin;
    if (t.includes('transaction') || t.includes('bank')) return CreditCard;
    if (t.includes('phone') || t.includes('call') || t.includes('sms')) return Smartphone;
    return FileText;
  };

  return (
    <PageCard
      title="Chronological Evidence Timeline"
      description="Multi-source chronological reconstruction normalized from GPS telemetry, EXIF, OCR, and surveillance logs."
    >
      {/* Event Details Drawer Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Timeline Event Inspector</span>
                <p className="text-sm font-semibold text-white mt-0.5">{new Date(selectedEvent.event_timestamp).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Modality:</span>
                  <span className="font-bold text-cyan-300 uppercase">{selectedEvent.source_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alibi Window Overlap:</span>
                  <span className={`font-semibold ${selectedEvent.inWindow ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {selectedEvent.inWindow ? '● INSIDE CLAIMED WINDOW (Active)' : '○ OUTSIDE CLAIMED WINDOW (Neutral)'}
                  </span>
                </div>
                {selectedEvent.distanceM != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance to Claimed Alibi:</span>
                    <span className={`font-bold font-mono ${selectedEvent.isDistanceMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedEvent.distanceM} meters {selectedEvent.isDistanceMatch ? '(Within 150m Match)' : '(Exceeds 150m Conflict)'}
                    </span>
                  </div>
                )}
                {selectedEvent.location_label && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location Label:</span>
                    <span className="text-slate-200">{selectedEvent.location_label}</span>
                  </div>
                )}
                {selectedEvent.location_lat != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Coordinates:</span>
                    <span className="font-mono text-slate-300">{selectedEvent.location_lat}, {selectedEvent.location_lng}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Description & Extracted Content</span>
                <p className="mt-1 text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedEvent.description || 'Normalized timeline event extracted from ingested digital evidence.'}
                </p>
              </div>

              {selectedEvent.raw_data && Object.keys(selectedEvent.raw_data).length > 0 && (
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Raw Source Metadata</span>
                  <pre className="mt-1 font-mono text-[10px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-[140px]">
                    {JSON.stringify(selectedEvent.raw_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 bg-slate-900/40 p-3 flex justify-end">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Selector & Alibi Target Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 min-w-[240px]">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Active Investigation Case</label>
            <select
              value={caseId}
              onChange={e => {
                setCaseId(e.target.value);
                setParams({ case_id: e.target.value });
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.suspect_name} ({c.title})
                </option>
              ))}
            </select>
          </div>

          {currentCase && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Claimed Location:</span>
                <span className="font-bold text-white">{currentCase.claimed_alibi_location || 'Not provided'}</span>
              </div>
              <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Alibi Window:</span>
                <span className="font-mono text-cyan-300">
                  {currentCase.claimed_alibi_start ? new Date(currentCase.claimed_alibi_start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'} → {currentCase.claimed_alibi_end ? new Date(currentCase.claimed_alibi_end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search timeline events..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Source:</span>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
          >
            <option value="ALL">All Modalities</option>
            <option value="gps">GPS Telemetry</option>
            <option value="cctv">CCTV Surveillance</option>
            <option value="image">Photographic EXIF</option>
            <option value="transaction">Transactions</option>
            <option value="phone_log">Phone / CDR</option>
          </select>
        </div>

        {/* Window Overlap Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Alibi Window:</span>
          <select
            value={windowFilter}
            onChange={e => setWindowFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
          >
            <option value="ALL">All Events ({enrichedEvents.length})</option>
            <option value="INSIDE">Inside Window Only</option>
            <option value="OUTSIDE">Outside Window (Neutral)</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setViewMode('visual')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${viewMode === 'visual' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Visual Track
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${viewMode === 'table' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Data Table
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${viewMode === 'map' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Geographic Map
          </button>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">{error}</div>}

      {/* Main Content Area based on View Mode */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 p-10 text-center text-xs text-slate-500">
            Reconstructing normalized timeline events from evidence files...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-10 text-center text-xs text-slate-500">
            <Clock size={28} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300 text-sm">No timeline events match the filter</p>
            <p className="mt-1">Ingest a GPS CSV, Photo with EXIF, or CCTV file into this case to extract events.</p>
            <Link to={`/upload-evidence?case_id=${caseId}`} className="mt-4 inline-block rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950">
              Ingest Evidence Files
            </Link>
          </div>
        ) : viewMode === 'visual' ? (
          /* VISUAL TRACK (Priority 4 from user request) */
          <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
            {filteredEvents.map((e, idx) => {
              const Icon = getSourceIcon(e.source_type);
              const isMatch = e.inWindow && (e.isDistanceMatch ?? true);
              const isConflict = e.inWindow && e.isDistanceMatch === false;
              const isNeutral = !e.inWindow;

              return (
                <div key={e.id || idx} className="relative group">
                  {/* Status Indicator Node on Track */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-3.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                    isMatch 
                      ? 'bg-emerald-400' 
                      : isConflict 
                      ? 'bg-rose-500' 
                      : 'bg-slate-600'
                  }`} />

                  {/* Card */}
                  <div 
                    onClick={() => setSelectedEvent(e)}
                    className="cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 hover:border-slate-700/80 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-white">
                          {new Date(e.event_timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          ({new Date(e.event_timestamp).toLocaleDateString()})
                        </span>
                        <span className="rounded bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300 uppercase flex items-center gap-1">
                          <Icon size={11} className="text-cyan-400" /> {e.source_type}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {isMatch && (
                          <span className="badge-supported inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                            <CheckCircle2 size={11} /> ALIBI MATCH {e.distanceM != null ? `(${e.distanceM}m)` : ''}
                          </span>
                        )}
                        {isConflict && (
                          <span className="badge-contradicted inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                            <XCircle size={11} /> CONFLICT {e.distanceM != null ? `(${e.distanceM}m)` : ''}
                          </span>
                        )}
                        {isNeutral && (
                          <span className="badge-neutral inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px]">
                            <Info size={11} /> Outside Window
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-200 font-medium">
                      {e.description || 'Normalized observation event'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-cyan-400" />
                        {e.location_label || (e.location_lat != null ? `${e.location_lat}, ${e.location_lng}` : 'No coordinate fix')}
                      </span>
                      <span className="text-cyan-400 hover:underline">
                        Inspect event details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'table' ? (
          /* DATA TABLE VIEW */
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Source Modality</th>
                  <th className="px-4 py-3">Location / GPS</th>
                  <th className="px-4 py-3">Alibi Overlap</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3 font-mono text-white whitespace-nowrap">
                      {new Date(e.event_timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 uppercase font-semibold text-cyan-300">
                      {e.source_type}
                    </td>
                    <td className="px-4 py-3 truncate max-w-[200px]">
                      {e.location_label || (e.location_lat != null ? `${e.location_lat}, ${e.location_lng}` : '—')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.inWindow ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                        {e.inWindow ? 'Inside Window' : 'Neutral'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {e.distanceM != null ? `${e.distanceM}m` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedEvent(e)}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* GEOGRAPHIC MAP VIEW */
          <GeographicMap
            claimedLocation={currentCase?.claimed_alibi_location || 'Claimed Alibi'}
            claimedLat={currentCase?.claimed_alibi_lat || 28.514430}
            claimedLng={currentCase?.claimed_alibi_lng || -96.990928}
            events={filteredEvents}
            toleranceM={150}
          />
        )}
      </div>
    </PageCard>
  );
}
