import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Globe, Zap, Search, MapPin, DollarSign, 
  ChevronRight, Loader2, Briefcase, ExternalLink 
} from 'lucide-react';
import { getToken, authHeaders, isLoggedIn } from '../utils/auth';

const ExternalJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const token = getToken();

  const fetchJobs = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const q = searchQuery || query || 'Software Engineer';
      const res = await axios.get(`http://localhost:5005/api/jobs/live?role=${encodeURIComponent(q)}`, {
        headers: authHeaders()
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Live search error:', err);
      setError('Neural market scan failed. Falling back to cached data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    if (token) {
        // Try to get role from profile or use default
        axios.get('http://localhost:5005/api/resume/profile', {
            headers: authHeaders()
        }).then(res => {
            const role = res.data.primary_job_role || 'Software Engineer';
            setQuery(role);
            fetchJobs(role);
        }).catch(() => fetchJobs('Software Engineer'));
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-enter px-4 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-4">
            <Globe className="text-blue-500" />
            Global Market
          </h2>
          <p className="text-muted text-lg">Real-time opportunities synced from LinkedIn, Naukri, and Indeed.</p>
        </div>
        
        <div className="w-full lg:w-[400px] relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search global roles..." 
              className="input-field pl-14 h-14"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            />
          </div>
          <button 
            onClick={() => fetchJobs()}
            className="p-4 bg-primary rounded-2xl hover:bg-primary-dark transition-all active:scale-95"
          >
            <Zap size={24} className="text-white fill-white" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 font-bold flex items-center gap-3">
          <Zap size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-muted font-bold uppercase tracking-widest text-xs">Scanning Global Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {jobs.map((job, idx) => (
            <div key={idx} className="glass-card p-8 group relative overflow-hidden transition-all duration-500 hover:scale-[1.01] border-blue-500/10">
              <div className="stat-accent opacity-10 bg-blue-500"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight leading-tight mb-1 line-clamp-1">{job.title}</h3>
                    <p className="text-blue-400 font-bold text-sm">{job.company}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-muted">
                  {job.source}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-8 text-sm text-muted font-medium">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 italic">
                  <MapPin size={14} className="text-blue-400" /> {job.location || 'Remote'}
                </div>
                {job.salary && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 italic">
                        <DollarSign size={14} /> {job.salary}
                    </div>
                )}
              </div>

              <div className="flex gap-2">
                <a 
                  href={job.applyLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-[4] h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                >
                  Apply on {job.source}
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
          
          {jobs.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center opacity-40 italic">
              <Search size={48} className="mb-4" />
              <p className="text-xl">No global signals detected. Try a different role sector.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExternalJobs;
