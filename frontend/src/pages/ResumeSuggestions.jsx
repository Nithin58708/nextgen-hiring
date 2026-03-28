import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';
import { Lightbulb, Info, Loader2, ChevronLeft, PlusCircle, Target, Zap, ShieldCheck, CheckCircle2, ArrowUpRight, Filter, AlertCircle } from 'lucide-react';

const ResumeSuggestions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobId, setJobId] = useState(searchParams.get('jobId'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const initializePage = async () => {
      if (jobId) {
        fetchSuggestions(jobId);
        return;
      }

      setLoading(true);
      try {
        const latestRes = await axios.get('http://localhost:5005/api/match/latest', {
          headers: authHeaders()
        });
        if (latestRes.data?.job_id) {
          setJobId(latestRes.data.job_id);
          fetchSuggestions(latestRes.data.job_id);
          return;
        }

        const jobsRes = await axios.get('http://localhost:5005/api/jobs', {
          headers: authHeaders()
        });
        if (jobsRes.data?.length > 0) {
          setJobId(jobsRes.data[0].id);
          fetchSuggestions(jobsRes.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auto-load failed', err);
        setLoading(false);
      }
    };
    initializePage();
  }, [token, navigate]);

  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/jobs', {
          headers: authHeaders()
        });
        setAllJobs(res.data);
      } catch (e) {}
    };
    if (isLoggedIn()) fetchJobs();
  }, [token]);

  const [error, setError] = useState(null);

  const fetchSuggestions = async (id) => {
    setLoading(true);
    setError(null);
    setData(null);
    setJobId(id);
    if (id) localStorage.setItem('targetJobId', id);
    try {
      const res = await axios.get(`http://localhost:5005/api/suggestions/roadmap?jobId=${id || ''}`, {
        headers: authHeaders()
      });
      console.log('Roadmap Data:', res.data);
      setData(res.data.roadmap || res.data);
      setJobRole(res.data.jobRole || '');
    } catch (err) {
      console.error('Failed to get suggestions', err);
      setError('Neural scan interrupted. Please select a valid target job or retry.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-20 h-20 border-4 border-white/5 border-t-primary rounded-full animate-spin mb-8 overflow-hidden relative">
            <div className="absolute inset-2 border-t-secondary border-4 rounded-full animate-spin-slow"></div>
        </div>
        <p className="text-muted font-black uppercase tracking-[0.4em] text-xs">Computing Strategic Vectors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-page-enter">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 glass-card p-10 border-primary/20">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shadow-purple-glow">
              <Target size={32} />
            </div>
            Strategic Roadmap
          </h2>
          <p className="text-muted font-medium max-w-xl">
            AI-optimized gap analysis for: <span className="text-primary font-black uppercase tracking-widest text-sm">
              {jobRole || data?.interviewTopics?.[4] || 'Professional Evolution'}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
             <select 
              value={jobId || ''}
              onChange={(e) => fetchSuggestions(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-white appearance-none cursor-pointer hover:border-primary transition-colors outline-none"
            >
              <option value="" disabled>Select Target Job</option>
              {allJobs.map(job => (
                <option key={job.id} value={job.id} className="bg-dark">{job.title} @ {job.company}</option>
              ))}
            </select>
          </div>

          {data && (
            <div className="w-full sm:w-80">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">Match Progress</span>
                    <span className="text-2xl font-black text-white">{data.currentMatchPercent}% <span className="text-xs text-muted">→ {data.targetMatchPercent}%</span></span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full transition-all duration-1000 ease-out shadow-purple-glow"
                        style={{width: `${data.currentMatchPercent}%`}}
                    ></div>
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Skill Gaps */}
          <div className="glass-card p-10">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
              <Zap size={24} className="text-yellow-500" /> Neural Gap Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 opacity-70">Skills You Have</p>
                <div className="flex flex-wrap gap-2">
                  {data?.skillsAlreadyHave?.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-[11px] font-bold uppercase">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 opacity-70">Skills To Acquire</p>
                <div className="flex flex-wrap gap-2">
                  {data?.skillsToAdd?.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[11px] font-bold uppercase">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Plan */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white">4-Week Immersion Plan</h3>
            <div className="space-y-4">
               {data?.weeklyPlan?.map((week, i) => (
                 <div key={i} className="glass-card p-6 border-white/5 flex gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex flex-col items-center justify-center shrink-0 border border-primary/30">
                       <span className="text-[10px] font-black text-primary uppercase">Week</span>
                       <span className="text-2xl font-black text-white">{week.week}</span>
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-white mb-2 uppercase tracking-wide">{week.focus}</h4>
                       <ul className="space-y-2">
                          {week.tasks.map((task, j) => (
                            <li key={j} className="text-sm text-white/60 flex items-center gap-3">
                               <CheckCircle2 size={14} className="text-primary" />
                               {task}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-10">
          {/* Learning Resources */}
          <div className="glass-card p-8 bg-primary/10 border-primary/20">
            <h3 className="text-xl font-bold text-white mb-6">Learning Path</h3>
            <div className="space-y-4">
              {data?.learningResources?.map((res, i) => (
                <a key={i} href={res.link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary transition-all">
                   <p className="text-[10px] font-bold text-primary uppercase mb-1">{res.platform} • {res.durationWeeks} Weeks</p>
                   <h4 className="text-sm font-black text-white mb-1">{res.course}</h4>
                   <p className="text-[10px] text-muted">Master {res.skill}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card p-8 text-center">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Estimated Readiness</p>
            <div className="text-4xl font-black text-white mb-4">{data?.estimatedReadyDate || 'Calculating...'}</div>
            <p className="text-xs text-muted">Based on your current velocity and skill gap.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSuggestions;
