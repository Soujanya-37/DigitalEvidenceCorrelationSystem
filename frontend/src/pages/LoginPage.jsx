import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, ShieldCheck, Fingerprint, Activity, FileSearch, ArrowLeft } from 'lucide-react';
import { login } from '../services/authService';
import api from '../services/api';

export default function LoginPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (registerMode) {
        await api.post('/auth/register', { full_name: name, email, password });
      }
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      nav(params.get('next') || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials or register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <div className="forensic-grid" />
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-950/90 shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
        
        {/* Left Side: System Problem Statement Overview */}
        <div className="hidden border-r border-slate-800 p-10 lg:flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="brand-mark">
                <Fingerprint size={23} />
              </div>
              <div>
                <p className="brand-kicker">DIGITAL FORENSICS</p>
                <p className="brand-title">Evidence Correlation</p>
              </div>
            </div>

            <div className="mt-14">
              <p className="text-[10px] font-bold uppercase tracking-[.32em] text-cyan-400">ALIBI VERIFICATION PLATFORM</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-white">
                Reconstruct the timeline.<br />
                <span className="text-cyan-300">Correlate the evidence.</span>
              </h1>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                A specialized forensic decision-support platform designed to ingest multi-source digital footprints, extract spatial-temporal metadata, and mathematically verify claimed subject alibis.
              </p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3 text-[10px] uppercase tracking-wider text-slate-400">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                <FileSearch size={15} className="mb-2 text-cyan-300" />
                <span>Multi-Source Ingestion</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                <Activity size={15} className="mb-2 text-emerald-300" />
                <span>150m Haversine Analysis</span>
              </div>
            </div>

            <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition">
              <ArrowLeft size={13} /> Back to Public Project Overview
            </Link>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-7 sm:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">
                <ShieldCheck size={19} />
              </div>
              <div>
                <p className="font-bold text-white text-base">{registerMode ? 'Create Analyst Account' : 'Analyst Workspace Sign In'}</p>
                <p className="text-xs text-slate-500">Restricted Forensic Decision Support Console</p>
              </div>
            </div>
            <Link to="/" className="lg:hidden text-xs text-slate-400 hover:text-white">
              Home
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
            <span className="status-dot status-dot-pulse" />
            <span>JWT-authenticated session required for case operations.</span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {registerMode && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs text-white"
                  placeholder="Investigator Name"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs text-white"
                placeholder="analyst@forensics.agency.gov"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Password</label>
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs text-white"
                placeholder="Minimum 8 characters"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition disabled:opacity-60"
            >
              <LockKeyhole size={14} />
              {loading ? (registerMode ? 'Creating account…' : 'Authenticating…') : (registerMode ? 'Register & Sign In' : 'Sign In to Workspace')}
              <ArrowRight size={14} />
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setRegisterMode(!registerMode);
              setError('');
            }}
            className="mt-4 w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition"
          >
            {registerMode ? 'Already have an account? Sign in' : 'New investigator? Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}
