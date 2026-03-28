import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getToken, getUser, isLoggedIn, logout } from '../utils/auth';
import { 
  BarChart3, 
  FileText, 
  Briefcase, 
  Target, 
  Lightbulb, 
  GraduationCap,
  ChevronRight,
  Zap,
  Globe,
  Layout,
  Bell
} from 'lucide-react';

const JobFinderDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [showUpdateBanner, setShowUpdateBanner] = React.useState(localStorage.getItem('testJustCompleted') === 'true');

  React.useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  const clearBanner = () => {
    localStorage.removeItem('testJustCompleted');
    setShowUpdateBanner(false);
  };

  return (
    <div className="flex h-screen bg-dark pt-20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-dark-card border-r border-white/5 flex-shrink-0 flex flex-col py-8 overflow-y-auto hidden lg:flex">
        <div className="px-8 mb-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Layout size={16} />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-muted">Intelligence Console</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink to="/finder" icon={<BarChart3 size={20} />} label="Performance Overview" end />
          <SidebarLink to="/finder/upload" icon={<FileText size={20} />} label="Resume Intelligence" />
          <SidebarLink to="/finder/jobs" icon={<Briefcase size={20} />} label="Opportunity Board" />
          <SidebarLink to="/finder/applications" icon={<Briefcase size={20} />} label="My Applications" />
          <SidebarLink to="/finder/matching" icon={<Target size={20} />} label="AI Match Analytics" />
          <SidebarLink to="/finder/suggestions" icon={<Lightbulb size={20} />} label="Strategic Roadmap" />
          <SidebarLink to="/finder/mock-test" icon={<GraduationCap size={20} />} label="Elite Mock Tests" />
          <SidebarLink to="/finder/external" icon={<Globe size={20} />} label="Global Job Market" />
        </nav>

        <div className="p-8">
          <div className="glass-card p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/20">
            <Zap size={24} className="text-primary mb-3 fill-primary" />
            <h4 className="font-bold text-white mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-muted mb-4">Get 10x more AI insights and unlimited tests.</p>
            <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/80 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-dark selection:bg-primary/20">
        <header className="px-8 lg:px-12 py-8 flex justify-between items-center border-b border-white/5 bg-dark/50 backdrop-blur-sm sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">System Dashboard</h2>
            <h3 className="text-2xl font-black text-white mt-1">Greetings, {user?.username || 'Candidate'}</h3>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted">
               <Bell size={20} />
             </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          {showUpdateBanner && (
            <div className="mb-10 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-subtle">
              <div className="flex items-center gap-4 text-yellow-500">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-sm">Strategic Roadmap Updated</h4>
                  <p className="text-xs font-medium text-white/60">Your mock test performance has been analyzed. Weak areas are now prioritized in your roadmap.</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <NavLink to="/finder/suggestions" onClick={clearBanner} className="flex-1 md:flex-none px-6 py-3 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-yellow-400 transition-all text-center">
                  View Roadmap
                </NavLink>
                <button onClick={clearBanner} className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, end = false }) => (
  <NavLink 
    to={to} 
    end={end}
    className={({ isActive }) => 
      isActive ? 'sidebar-item-active' : 'sidebar-item'
    }
  >
    <div className="flex items-center space-x-4">
      <div className="transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="tracking-tight">{label}</span>
    </div>
    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all duration-300" />
  </NavLink>
);

export default JobFinderDashboard;
