import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusSquare, 
  ListChecks, 
  Users, 
  ChevronRight,
  LogOut,
  Zap,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Clock
} from 'lucide-react';

export const PosterOverview = () => {
  const { token } = useAuth();
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/stats/poster', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({
          total: res.data.total_jobs_posted,
          pending: res.data.pending_jobs,
          approved: res.data.approved_jobs
        });
      } catch (err) {
        console.error('Failed to fetch poster stats', err);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="space-y-12 animate-page-enter">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Total Roles Initiated" value={stats.total} icon={<Zap className="text-secondary" />} trend="All Vectors" />
        <StatCard label="Pending Validation" value={stats.pending} icon={<Clock className="text-primary" />} trend="In Review" />
        <StatCard label="Approved & Live" value={stats.approved} icon={<ShieldCheck className="text-emerald-500" />} trend="Operational" />
      </div>
      
      <div className="glass-card p-10">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <Clock size={20} className="text-secondary" /> Recent Acquisition Activity
        </h3>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="font-bold text-white">Senior ML Engineer</p>
                  <p className="text-xs text-muted">Posted 2 days ago &bull; 12 new applicants</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend }) => (
  <div className="stat-card group">
    <div className="stat-accent opacity-20"></div>
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl">
        {icon}
      </div>
      <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/10">{trend}</div>
    </div>
    <div className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</div>
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{label}</div>
  </div>
);

const JobPosterDashboard = () => {
  return (
    <div className="flex h-screen bg-dark pt-20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-dark-card border-r border-white/5 flex-shrink-0 flex flex-col py-8 overflow-y-auto hidden lg:flex">
        <div className="px-8 mb-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/30">
              <Briefcase size={16} />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-muted">Employer Console</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink to="/poster" icon={<LayoutDashboard size={20} />} label="Operational Overview" end />
          <SidebarLink to="/poster/post-job" icon={<PlusSquare size={20} />} label="Initialize Role" />
          <SidebarLink to="/poster/my-jobs" icon={<ListChecks size={20} />} label="Active Postings" />
          <SidebarLink to="/poster/candidates" icon={<Users size={20} />} label="Candidate Vectors" />
        </nav>

        <div className="p-8">
          <div className="glass-card p-6 bg-gradient-to-br from-secondary/20 to-primary/20 border-secondary/20">
            <ShieldCheck size={24} className="text-secondary mb-3" />
            <h4 className="font-bold text-white mb-1">Verify Account</h4>
            <p className="text-xs text-muted mb-4">Complete your corporate profile to unlock premium matching.</p>
            <button className="w-full py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/80 transition-all">
              Verify Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-dark">
        <header className="px-8 lg:px-12 py-8 flex justify-between items-center border-b border-white/5 bg-dark/50 backdrop-blur-sm sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-secondary">Talent Acquisition</h2>
            <h3 className="text-2xl font-black text-white mt-1">Employer Interface</h3>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
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
      `group ${isActive ? 'sidebar-item-active text-secondary bg-secondary/10 border-secondary/20' : 'sidebar-item hover:text-secondary'}`
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

export default JobPosterDashboard;
