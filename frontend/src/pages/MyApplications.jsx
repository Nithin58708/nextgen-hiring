import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Timer,
  Trophy,
  Zap
} from 'lucide-react';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('local');
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/jobs/my-applications', {
          headers: authHeaders()
        });
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="px-4 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <Trophy size={14} /> Shortlisted ⭐
          </span>
        );
      case 'rejected':
        return (
          <span className="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <XCircle size={14} /> Rejected
          </span>
        );
      case 'hired':
        return (
          <span className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={14} /> Hired! 🎉
          </span>
        );
      default:
        return (
          <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <Timer size={14} /> Applied
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-page-enter">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">My Applications</h2>
          <p className="text-muted text-lg">Track the status of your current job vectors.</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0">
           <button 
             onClick={() => setActiveTab('local')}
             className={`px-8 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-primary text-white shadow-purple-glow' : 'text-muted hover:text-white'}`}
           >
             Platform Jobs
           </button>
           <button 
             onClick={() => setActiveTab('global')}
             className={`px-8 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'global' ? 'bg-primary text-white shadow-purple-glow' : 'text-muted hover:text-white'}`}
           >
             Global Track
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted font-bold uppercase tracking-widest text-xs">Pulling application state...</p>
        </div>
      ) : activeTab === 'local' ? (
        applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {applications.map((app) => (
              <div key={app.id} className="glass-card p-10 group relative transition-all duration-500 hover:scale-[1.01] shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/30 transition-all duration-500 shadow-xl">
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{app.title}</h3>
                      <p className="text-primary font-bold tracking-tight">{app.company}</p>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4 text-sm text-muted font-medium bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <Calendar size={18} className="text-primary" />
                      <span>Applied on {new Date(app.applied_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted font-medium bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <Clock size={18} className="text-primary" />
                      <span>Current Status: <span className="text-white ml-2 font-black uppercase tracking-widest text-xs">{app.status}</span></span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted font-medium bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <Zap size={18} className="text-yellow-400" />
                      <span>Match Score: <span className="text-white ml-2 font-black text-lg">{app.match_score != null ? app.match_score + '%' : 'Pending'}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <Link 
                    to={`/finder/matching?jobId=${app.job_id}`}
                    className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                  >
                    <ExternalLink size={18} className="text-primary" />
                    View Match
                  </Link>
                  <Link 
                    to={`/finder/jobs`}
                    className="p-4 bg-primary text-white rounded-2xl hover:bg-primary/80 transition-all shadow-purple-glow"
                  >
                    <ChevronRight size={24} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center text-center glass-card border-dashed">
            <Search size={64} className="text-muted/20 mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">No Applications Found</h3>
            <p className="text-muted mb-10 max-w-md">You haven't applied to any roles yet. Explore the Opportunity Board to find your next career vector.</p>
            <Link to="/finder/jobs" className="btn-primary px-10">Explore Opportunities</Link>
          </div>
        )
      ) : (
        <div className="glass-card p-16 text-center">
           <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/30 shadow-purple-glow">
              <Zap size={40} />
           </div>
           <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Global Opportunity Tracker</h3>
           <p className="text-muted mb-10 max-w-xl mx-auto text-lg">AI is monitoring external vectors at companies like Microsoft, Google, and Amazon. You will be notified instantly via email when your neural match score exceeds 85%.</p>
           <button className="btn-gradient-purple px-12 h-16 text-xs font-black uppercase tracking-[0.2em] shadow-premium">
              Activate Neural Monitoring
           </button>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
