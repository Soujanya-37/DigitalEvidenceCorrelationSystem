import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCircle2, 
  LayoutDashboard, 
  PlusCircle, 
  ListChecks, 
  Clock3, 
  BrainCircuit, 
  FileText, 
  LogOut, 
  UploadCloud,
  HelpCircle,
  Fingerprint
} from 'lucide-react';
import ProjectExplainerModal from './ProjectExplainerModal';

const navSections = [
  {
    title: 'Casework',
    links: [
      { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { to: '/cases', label: 'Case Inventory', icon: ListChecks },
      { to: '/create-case', label: 'New Case', icon: PlusCircle },
      { to: '/upload-evidence', label: 'Ingest Evidence', icon: UploadCloud },
    ],
  },
  {
    title: 'Correlation & Analysis',
    links: [
      { to: '/timeline', label: 'Timeline Reconstructor', icon: Clock3 },
      { to: '/ai-analysis', label: 'Alibi Verification Engine', icon: BrainCircuit },
      { to: '/reports', label: 'Investigation Reports', icon: FileText },
    ],
  },
  {
    title: 'Settings',
    links: [
      { to: '/profile', label: 'Analyst Profile', icon: UserCircle2 },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExplainer, setShowExplainer] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return 'Command Center';
    if (p.includes('/create-case')) return 'Open New Investigation';
    if (p.includes('/cases/')) return 'Case Dossier & Evidence';
    if (p.includes('/cases')) return 'Case Inventory';
    if (p.includes('/upload-evidence')) return 'Ingest Evidence File';
    if (p.includes('/timeline')) return 'Timeline Reconstruction';
    if (p.includes('/ai-analysis')) return 'Alibi Correlation & Verification';
    if (p.includes('/reports')) return 'Investigation Reports';
    if (p.includes('/profile')) return 'Analyst Profile & Credentials';
    return 'Forensic Workspace';
  };

  return (
    <div className="app-shell min-h-screen text-slate-100 flex flex-col lg:flex-row">
      {/* Project Explainer / Defense Modal */}
      <ProjectExplainerModal 
        isOpen={showExplainer} 
        onClose={() => setShowExplainer(false)} 
      />

      {/* Streamlined Professional Sidebar */}
      <aside className="forensic-sidebar w-full lg:w-[260px] lg:shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        <div className="p-4 lg:p-5">
          {/* Crisp Brand Block */}
          <Link to="/" className="brand-block mb-6 block hover:border-slate-700 transition" title="Go to Project Home">
            <div className="flex items-center gap-3">
              <div className="brand-mark">
                <Fingerprint size={20} />
              </div>
              <div className="min-w-0">
                <p className="brand-kicker">EVIDENCE CORRELATE</p>
                <p className="brand-title truncate">Forensic Suite</p>
              </div>
            </div>
          </Link>

          {/* Navigation Menus */}
          <nav className="space-y-5">
            {navSections.map(sec => (
              <div key={sec.title}>
                <p className="nav-label">{sec.title}</p>
                <div className="mt-1 space-y-1">
                  {sec.links.map(({ to, label, icon: Icon }) => (
                    <NavLink 
                      key={to} 
                      to={to} 
                      className={({ isActive }) => `forensic-nav ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={16} />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Minimalist Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">Analyst Connected</span>
            </div>
            <ShieldCheck size={14} className="text-slate-500" />
          </div>

          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative min-w-0 flex-1 px-4 pb-12 pt-4 lg:px-8 lg:pt-6">
        {/* Streamlined Topbar */}
        <header className="forensic-topbar mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span>Digital Evidence Correlation</span>
              <span>/</span>
              <span className="text-cyan-400 font-semibold">{getPageTitle()}</span>
            </div>
            <h1 className="mt-0.5 truncate text-lg font-bold text-white">
              {getPageTitle()}
            </h1>
          </div>

          {/* Clean Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowExplainer(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
            >
              <HelpCircle size={14} className="text-cyan-400" /> System Architecture Guide
            </button>

            <NavLink
              to="/create-case"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition shadow-sm"
            >
              <PlusCircle size={14} /> New Case
            </NavLink>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
