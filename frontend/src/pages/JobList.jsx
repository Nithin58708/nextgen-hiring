import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Zap, Search, MapPin, DollarSign, Briefcase,
  Target, Loader2, CheckCircle2, Send, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getToken, authHeaders, isLoggedIn } from '../utils/auth';

const JobList = () => {
  const navigate = useNavigate();
  const token = getToken();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [applyModal, setApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5005/api/jobs', {
        headers: authHeaders()
      });
      setJobs(res.data.jobs || res.data || []);

      const appRes = await axios.get('http://localhost:5005/api/jobs/my-applications', {
        headers: authHeaders()
      });
      setAppliedJobs(appRes.data.map(a => a.job_id));
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setApplyModal(true);
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      await axios.post(
        `http://localhost:5005/api/jobs/${selectedJob.id}/apply`,
        { coverLetter },
        { headers: authHeaders() }
      );
      setAppliedJobs(prev => [...prev, selectedJob.id]);
      setApplyModal(false);
      setCoverLetter('');
      setSelectedJob(null);
      Swal.fire({
        title: 'Neural Submission Complete',
        text: 'Your application has been logged and the employer notified.',
        icon: 'success',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#10B981'
      });
    } catch (err) {
      Swal.fire({
        title: 'Transmission Error',
        text: err.response?.data?.error || 'Failed to submit application',
        icon: 'error',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#7C3AED'
      });
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-enter px-4 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Internal Network</h2>
          <p className="text-muted text-lg">Direct opportunities from verified NextGen posters.</p>
        </div>
        
        <div className="w-full lg:w-[400px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search roles or companies..." 
            className="input-field pl-14 h-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted font-bold uppercase tracking-widest text-xs">Syncing Job Vectors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="glass-card p-8 group relative overflow-hidden transition-all duration-500 hover:scale-[1.01] shadow-2xl">
                <div className="stat-accent opacity-20"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-muted group-hover:text-primary transition-all duration-500">
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-1">{job.title}</h3>
                      <p className="text-primary font-bold">{job.company}</p>
                    </div>
                  </div>
                  {appliedJobs.includes(job.id) && (
                    <span className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} /> Applied
                    </span>
                  )}
                </div>

                <p className="text-muted mb-8 line-clamp-2 max-w-3xl">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted font-medium mb-8 relative z-10">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <MapPin size={16} /> {job.location}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <DollarSign size={16} /> {job.salary}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                    <Zap size={16} /> {job.applicant_count || 0} Applicants
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-white/5">
                  <Link 
                    to={`/finder/matching?jobId=${job.id}`}
                    className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                  >
                    <Target size={18} className="text-primary" />
                    <span>Match Analysis</span>
                  </Link>
                  
                  {appliedJobs.includes(job.id) ? (
                    <button disabled className="flex-[1.5] h-14 bg-white/5 text-muted border border-white/5 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-not-allowed">
                      <CheckCircle2 size={18} /> Already Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApplyClick(job)}
                      className="flex-[1.5] btn-gradient-purple h-14 text-base font-black flex items-center justify-center gap-3 shadow-lg active:scale-95"
                    >
                      <Send size={18} />
                      Initialize Application
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center text-center opacity-50">
              <Search size={40} className="mb-4" />
              <p>No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="absolute inset-0 bg-background/80" onClick={() => !applying && setApplyModal(false)}></div>
          <div className="relative w-full max-w-xl glass-card overflow-hidden animate-page-enter">
            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter mb-1">Apply</h2>
                  <p className="text-muted font-bold text-sm">{selectedJob?.title} at {selectedJob?.company}</p>
                </div>
                <button onClick={() => setApplyModal(false)} className="text-muted hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Cover Letter</label>
                  <textarea 
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Why are you a good fit?"
                    className="input-field min-h-[150px] py-4 resize-none"
                    disabled={applying}
                  ></textarea>
                </div>
                <button 
                  onClick={submitApplication}
                  disabled={applying}
                  className="btn-gradient-purple w-full h-14 text-lg font-black flex items-center justify-center gap-3"
                >
                  {applying ? (
                    <><Loader2 className="animate-spin" size={20} /> Transmitting...</>
                  ) : (
                    <><Send size={18} /> Submit Application</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
