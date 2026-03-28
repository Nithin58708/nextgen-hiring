import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, getUser, isLoggedIn, authHeaders, parseSkills } from '../utils/auth';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Target, 
  Users, 
  Building2, 
  Wallet,
  X,
  Mail,
  Trophy,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Loader2,
  FileText
} from 'lucide-react';
import Swal from 'sweetalert2';

const MyJobPosts = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const user = getUser();

  // Applicants view state
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const fetchMyJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/jobs/my-jobs', {
          headers: authHeaders()
        });
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch my jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyJobs();
  }, [token, navigate]);

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setShowApplicants(true);
    setLoadingApplicants(true);
    try {
      const res = await axios.get(`http://localhost:5005/api/jobs/${job.id}/applicants`, {
        headers: authHeaders()
      });
      setApplicants(res.data);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingStatus(appId);
    try {
      await axios.patch(`http://localhost:5005/api/jobs/applications/${appId}/status`, 
        { status: newStatus },
        { headers: authHeaders() }
      );
      
      // Update local state
      setApplicants(prev => prev.map(a => 
        a.id === appId ? { ...a, status: newStatus } : a
      ));
      
      Swal.fire({
        title: 'Status Updated',
        text: `Application ${newStatus} successfully! Email sent to candidate.`,
        icon: 'success',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#7C3AED'
      });
    } catch (err) {
      Swal.fire({
        title: 'Update Failed',
        text: err.response?.data?.error || 'Failed to update status',
        icon: 'error',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#7C3AED'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
        case 'shortlisted': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
        case 'hired': return 'text-green-400 bg-green-400/10 border-green-400/20';
        default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-page-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Operational Postings</h2>
          <p className="text-muted text-lg">Manage your active corporate vectors and candidate pipelines.</p>
        </div>
        <Link to="/poster/post-job" className="btn-gradient-purple px-8 h-14 text-sm flex items-center gap-2">
          Initialize New Role
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <div className="w-16 h-16 border-4 border-white/5 border-t-secondary rounded-full animate-spin"></div>
           <p className="text-muted font-black tracking-[0.4em] text-xs uppercase">Syncing Active Vectors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="glass-card p-8 lg:p-10 group relative transition-all duration-300 hover:border-white/10">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl
                        ${job.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                          job.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                          'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}
                      `}>
                        <Briefcase size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-3">{job.title}</h3>
                        <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-widest text-[10px]">
                           <Building2 size={14} /> {job.company}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-white/5">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Financial Package</p>
                          <p className="text-lg font-bold text-white flex items-center gap-2"><Wallet size={16} className="text-emerald-500" /> {job.salary}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Temporal Origin</p>
                          <p className="text-lg font-bold text-white flex items-center gap-2"><Clock size={16} className="text-muted" /> {new Date(job.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="col-span-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Core Pre-requisites</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                              {parseSkills(job.required_skills).map((skill, idx) => (
                               <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white">
                                  {skill}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col gap-4">
                    <div className={`p-6 rounded-2xl border flex flex-col items-center text-center
                      ${job.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 
                        job.status === 'rejected' ? 'bg-red-500/5 border-red-500/10 text-red-500' : 
                        'bg-yellow-500/5 border-yellow-500/10 text-yellow-500'}
                    `}>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Status Descriptor</p>
                      <h4 className="text-2xl font-black uppercase flex items-center gap-3">
                         {job.status === 'approved' ? <CheckCircle /> : job.status === 'rejected' ? <XCircle /> : <Clock />}
                         {job.status}
                      </h4>
                    </div>

                    <div className="flex flex-col gap-2">
                       <button 
                         onClick={() => handleViewApplicants(job)}
                         className="w-full h-14 bg-primary/20 text-primary border border-primary/30 rounded-2xl hover:bg-primary/30 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Users size={18} /> View Applicants
                       </button>
                       <div className="flex gap-2">
                            <button className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                <Eye size={14} /> Details
                            </button>
                            <button className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                <Target size={14} /> Analysis
                            </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-32 text-center flex flex-col items-center">
               <Briefcase size={64} className="text-muted opacity-10 mb-8" />
               <h3 className="text-3xl font-black text-white mb-4">No job postings yet.</h3>
               <p className="text-muted max-w-sm mb-12 text-lg">Click Initialize Role to post your first job and start scaling your neural workforce.</p>
               <Link to="/poster/post-job" className="btn-gradient-purple px-12 h-16">Initialize First Role</Link>
            </div>
          )}
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicants && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20 backdrop-blur-md">
            <div className="absolute inset-0 bg-background/90" onClick={() => setShowApplicants(false)}></div>
            <div className="relative w-full max-w-5xl h-full flex flex-col glass-card border-primary/20 animate-page-enter">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Candidate Pipeline</h2>
                        <p className="text-primary font-bold text-sm">{selectedJob?.title} Portfolio</p>
                    </div>
                    <button onClick={() => setShowApplicants(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {loadingApplicants ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="text-muted font-black tracking-widest uppercase text-xs">Decrypting Candidate Nodes...</p>
                        </div>
                    ) : applicants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {applicants.map((app) => (
                                <div key={app.id} className="glass-card p-8 border-white/5 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
                                                {(app.username || 'U')[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white leading-none mb-1">{app.username}</h4>
                                                <p className="text-muted text-xs flex items-center gap-2"><Mail size={12} /> {app.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                Match: {app.match_score || 0}%
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                                                {app.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Statement of Intent</p>
                                        <p className="text-sm text-white/80 leading-relaxed italic">
                                            "{app.cover_letter || 'No cover letter provided.'}"
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <select 
                                                value={app.status}
                                                onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                                disabled={updatingStatus === app.id}
                                                className="w-full h-12 pl-4 pr-10 appearance-none bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-widest focus:border-primary/50 transition-all cursor-pointer outline-none"
                                            >
                                                <option value="applied">Applied</option>
                                                <option value="shortlisted">Shortlist</option>
                                                <option value="rejected">Reject</option>
                                                <option value="hired">Hire</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted" size={16} />
                                        </div>
                                        <button className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-xs flex items-center gap-2">
                                            <FileText size={16} className="text-primary" /> Profile
                                        </button>
                                    </div>
                                    
                                    {updatingStatus === app.id && (
                                        <div className="mt-4 flex items-center justify-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                            <Loader2 className="animate-spin" size={12} /> Updating Pipeline...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <Users size={64} className="text-muted opacity-10 mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2">No Candidates Identified</h3>
                            <p className="text-muted max-w-sm">The neural network has not yet detected any incoming application vectors for this role.</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Real-time Monitoring</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div> AI Score Correlation active</div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyJobPosts;
