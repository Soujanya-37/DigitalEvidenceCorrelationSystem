import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  User, 
  Tag, 
  FileText,
  Compass
} from 'lucide-react';
import PageCard from '../components/PageCard';
import { createCase } from '../services/caseService';

const DEMO_PRESETS = [
  {
    name: 'Subject 208 Photo Alibi',
    title: 'Photographic Alibi Verification',
    suspectName: 'Research Subject 208',
    location: 'Port Lavaca Harbor',
    lat: '28.514430',
    lng: '-96.990928',
    priority: 'High',
    alibiStart: '2026-10-05T09:00',
    alibiEnd: '2026-10-05T09:30',
    summary: 'The subject claims to have been at the documented harbor location during the stated morning time period.',
  },
  {
    name: 'City Central Mall Incident',
    title: 'City Central Mall Incident',
    suspectName: 'Rahul Sharma',
    location: 'City Central Mall',
    lat: '12.971598',
    lng: '77.594562',
    priority: 'High',
    alibiStart: '2026-08-31T18:00',
    alibiEnd: '2026-08-31T20:00',
    summary: 'The suspect claims to have been shopping at City Central Mall between 6:00 PM and 8:00 PM.',
  },
  {
    name: 'GeoLife GPS Telemetry',
    title: 'GeoLife GPS Trajectory Verification',
    suspectName: 'Subject 128',
    location: 'Beijing Tech Corridor',
    lat: '39.981433',
    lng: '116.302195',
    priority: 'Critical',
    alibiStart: '2026-09-01T08:00',
    alibiEnd: '2026-09-01T11:00',
    summary: 'Subject claims continuous presence at the Tech Corridor during morning hours.',
  },
];

export default function CreateCasePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [priority, setPriority] = useState('High');
  const [summary, setSummary] = useState('');
  const [alibiStart, setAlibiStart] = useState('');
  const [alibiEnd, setAlibiEnd] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setSuspectName(preset.suspectName);
    setLocation(preset.location);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setPriority(preset.priority);
    setAlibiStart(preset.alibiStart);
    setAlibiEnd(preset.alibiEnd);
    setSummary(preset.summary);
    setError('');
  };

  // Calculate window duration if both dates valid
  let durationStr = null;
  if (alibiStart && alibiEnd) {
    const s = new Date(alibiStart);
    const e = new Date(alibiEnd);
    if (e > s) {
      const diffMs = e - s;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      durationStr = `${diffHrs}h ${diffMins}m duration`;
    }
  }

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim()) return setError('Please enter a case title.');
    if (!suspectName.trim()) return setError('Please enter the suspect name.');
    if (!summary.trim()) return setError('Please describe the claimed alibi statement.');

    if (alibiStart && alibiEnd) {
      if (new Date(alibiStart) >= new Date(alibiEnd)) {
        return setError('Alibi end time must be later than the start time.');
      }
    }

    setLoading(true);

    try {
      const caseData = {
        title: title.trim(),
        suspect_name: suspectName.trim(),
        description: summary.trim(),
        priority,
        claimed_alibi_text: summary.trim(),
        claimed_alibi_location: location.trim() || null,
        claimed_alibi_lat: latitude ? Number(latitude) : null,
        claimed_alibi_lng: longitude ? Number(longitude) : null,
        claimed_alibi_start: alibiStart ? new Date(alibiStart).toISOString() : null,
        claimed_alibi_end: alibiEnd ? new Date(alibiEnd).toISOString() : null,
      };

      const created = await createCase(caseData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/cases/${created.id}`);
      }, 700);
    } catch (err) {
      console.error('Create case error:', err);
      setError(err.response?.data?.detail || 'Failed to create case. Verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard
      title="Open New Investigation"
      description="Initialize an investigation case container and define the subject's claimed alibi parameters."
    >
      {/* Demo Presets Bar for Live Presentations */}
      <div className="mb-5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">Quick Test Scenarios:</span>
          </div>
          <span className="text-[11px] text-slate-400">Auto-fill benchmark alibi cases:</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              + {p.name}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-300">
          <CheckCircle2 size={18} />
          <div>
            <p className="text-sm font-bold">Investigation Created Successfully</p>
            <p className="text-xs text-slate-400">Redirecting to evidence ingestion workspace...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300">
          <AlertCircle size={18} />
          <div>
            <p className="text-sm font-bold">Unable to create case</p>
            <p className="text-xs text-rose-200/80">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleCreateCase} className="space-y-6">
        
        {/* Section 1: Case & Subject Details */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <User size={14} /> 1. Investigation & Suspect Identification
          </h3>
          
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Case Title / Incident Name *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. City Central Mall Robbery Alibi Verification"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Investigation Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-sm text-white"
                disabled={loading}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Suspect / Subject Name *</label>
              <input
                type="text"
                value={suspectName}
                onChange={e => setSuspectName(e.target.value)}
                placeholder="e.g. Rahul Sharma or Research Subject 208"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Claimed Alibi Details (The heart of the problem statement) */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Compass size={14} /> 2. Claimed Alibi Specification (Verification Target)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              TARGET OF CORRELATION
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-cyan-400" /> Claimed Location Name
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. City Central Mall, 2nd Floor Food Court"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white"
                disabled={loading}
              />
            </div>

            {/* GPS Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Latitude (GPS)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  placeholder="28.514430"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-sm text-white font-mono"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Longitude (GPS)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  placeholder="-96.990928"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-sm text-white font-mono"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Time Window */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock size={13} className="text-cyan-400" /> Alibi Window Start Time
              </label>
              <input
                type="datetime-local"
                value={alibiStart}
                onChange={e => setAlibiStart(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-sm text-white font-mono"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Clock size={13} className="text-cyan-400" /> Alibi Window End Time
                </label>
                {durationStr && <span className="font-mono text-[10px] text-cyan-300 font-bold">{durationStr}</span>}
              </div>
              <input
                type="datetime-local"
                value={alibiEnd}
                onChange={e => setAlibiEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-sm text-white font-mono"
                disabled={loading}
              />
            </div>

            {/* Alibi Narrative Statement */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Suspect's Formal Claim Statement *
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="The suspect asserts they were at the claimed location continuously throughout the specified time interval..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white resize-none"
                required
                disabled={loading}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                This exact claim statement and time window will be checked by the correlation engine against every piece of ingested evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
          <p className="text-xs text-slate-500">
            Case will be saved in PostgreSQL with UUID tracking.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition disabled:opacity-50"
          >
            {loading ? 'Initializing Investigation...' : 'Create Case & Begin Evidence Intake →'}
          </button>
        </div>
      </form>
    </PageCard>
  );
}