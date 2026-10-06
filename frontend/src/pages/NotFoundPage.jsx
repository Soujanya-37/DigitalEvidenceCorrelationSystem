import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] px-4 text-center text-slate-100">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_0_40px_rgba(56,189,248,0.08)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
          <Compass size={24} />
        </div>
        <p className="mt-5 text-sm uppercase tracking-[0.3em] text-cyan-400">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Investigation route not found</h1>
        <p className="mt-3 text-slate-400">The requested investigation route is not available. Return to the operations console.</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-3 font-semibold text-slate-950">
          <Home size={16} /> Return to dashboard
        </Link>
      </div>
    </div>
  );
}
