import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  CheckCircle, 
  Target, 
  TrendingUp,
  Briefcase,
  Zap,
  ArrowUpRight,
  Clock,
  GraduationCap,
  PenTool
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';

const JobFinderOverview = () => {
  const navigate = useNavigate();
  const user = getUser();
  const token = getToken();
  const [stats, setStats] = useState({
    jobsMatched: 0,
    testsTaken: 0,
    resumeUploaded: false,
    avgMatchScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/stats/finder', {
          headers: authHeaders()
        });
        setStats({
          jobsMatched: res.data.jobs_matched || 0,
          testsTaken: res.data.tests_taken || 0,
          resumeUploaded: !!res.data.resume_uploaded,
          avgMatchScore: res.data.avg_match_score || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchStats();
    else setLoading(false);
  }, [token, navigate]);

  const handleUpdateEmail = () => {
    Swal.fire({
      title: 'Update Contact Email',
      html: `
        <p class="text-xs text-muted mb-4">You will receive application updates here.</p>
        <input type="email" id="swal-email" class="swal2-input bg-dark text-white border-white/10" value="${user?.email || ''}" placeholder="Enter new email">
      `,
      background: '#1E293B',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'Update Email',
      customClass: {
        popup: 'glass-card border border-white/10 rounded-2xl',
        confirmButton: 'bg-primary text-white font-bold rounded-xl px-6 py-2',
        cancelButton: 'bg-white/5 text-white font-bold rounded-xl px-6 py-2 ml-2'
      },
      preConfirm: () => {
        const newEmail = document.getElementById('swal-email').value;
        if (!newEmail || !newEmail.includes('@')) {
          Swal.showValidationMessage('Please enter a valid email address');
        }
        return newEmail;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put('http://localhost:5005/api/auth/profile', 
            { email: result.value }, 
            { headers: authHeaders() }
          );
          if (res.data.success) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            Swal.fire({
               icon: 'success',
               title: 'Updated!',
               text: 'Your contact email has been updated successfully.',
               background: '#1E293B', color: '#fff',
               showConfirmButton: false, timer: 1500
            }).then(() => window.location.reload());
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err.response?.data?.error || 'Could not update email',
            background: '#1E293B', color: '#fff'
          });
        }
      }
    });
  };

  if (loading) return <div className="p-20 text-center text-white">Initializing Neural Dashboard...</div>;

  return (
    <div className="space-y-12 animate-page-enter">
      {/* Top Banner */}
      <div className="glass-card p-10 bg-gradient-to-r from-dark-card to-dark-accent border-primary/20 flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4 border border-primary/20">
            <Zap size={10} className="fill-primary" />
            <span>Profile Optimization Active</span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Your Career Intelligence Hub</h2>
          <p className="text-muted text-lg max-w-xl">
            Welcome, {user?.name?.split(' ')[0] || user?.username || 'Candidate'}. 
            Your contact email is <span className="text-primary font-bold cursor-pointer hover:underline inline-flex items-center gap-1" onClick={handleUpdateEmail}>{user?.email || 'Not Set'} <PenTool size={12}/></span>.
            <br/><br/>
            Your profile is currently being tracked against <span className="text-white font-bold">128 active roles</span> in our network.
          </p>
        </div>
        <Link to="/finder/jobs" className="btn-gradient-purple h-16 px-10 whitespace-nowrap">
          Launch Search Board <ArrowUpRight size={20} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewStat label="Opportunity Matches" value={stats.jobsMatched} icon={<Target className="text-primary" />} trend="Across Network" />
        <OverviewStat label="Resume Status" value={stats.resumeUploaded ? 'Active' : 'Missing'} icon={<FileText className="text-secondary" />} trend={stats.resumeUploaded ? 'Ready for AI' : 'Upload Required'} />
        <OverviewStat label="Mock Tests Taken" value={stats.testsTaken} icon={<CheckCircle className="text-emerald-500" />} trend="Skills Evaluated" />
        <OverviewStat label="Avg Match Score" value={`${stats.avgMatchScore}%`} icon={<Zap className="text-yellow-500" />} trend="Real-time Accuracy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <TrendingUp className="text-primary" /> Recent System Activity
          </h3>
          <div className="glass-card divide-y divide-white/5">
             <ActivityRow icon={<Briefcase />} title="New Match Found" desc="Senior React Engineer at Global Tech" time="15m ago" />
             <ActivityRow icon={<FileText />} title="System Idle" desc="Waiting for new resume upload" time="2h ago" />
             <ActivityRow icon={<Zap />} title="AI Suggestion" desc="Strategic advice generated for your profile" time="Yesterday" />
          </div>
        </div>

        {/* Action Card */}
        <div className="lg:col-span-1">
           <div className="glass-card p-8 bg-primary/5 border-primary/20 h-full flex flex-col">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/30">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Elite Training</h3>
              <p className="text-muted leading-relaxed mb-10 flex-grow">
                Start a proctored mock interview generated specifically for your target roles. Get deep AI feedback on your performance.
              </p>
              <Link to="/finder/mock-test" className="btn-gradient-purple w-full">
                Begin Mock Test
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

const OverviewStat = ({ label, value, icon, trend }) => (
  <div className="stat-card group">
    <div className="stat-accent"></div>
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</div>
    </div>
    <div className="text-4xl font-black text-white mb-2">{value}</div>
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{label}</div>
  </div>
);

const ActivityRow = ({ icon, title, desc, time }) => (
  <div className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
    <div className="flex items-center space-x-5">
      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-muted group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-white text-lg">{title}</h4>
        <p className="text-muted text-sm">{desc}</p>
      </div>
    </div>
    <div className="text-xs font-bold text-muted flex items-center gap-1.5 opacity-60">
      <Clock size={12} /> {time}
    </div>
  </div>
);

export default JobFinderOverview;
