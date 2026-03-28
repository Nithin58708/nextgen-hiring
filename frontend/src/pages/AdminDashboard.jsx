import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Briefcase, ShieldCheck,
  TrendingUp, Search, CheckCircle, XCircle,
  BarChart3, Bell, LogOut, Edit2, Trash2,
  Plus, X, FileText, Loader2
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { getToken, isLoggedIn, authHeaders, logout as authLogout } from '../utils/auth';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalFinders: 0, totalPosters: 0, totalJobs: 0,
    totalApplications: 0, pendingJobs: 0, resumesUploaded: 0, testsTaken: 0
  });
  const [allJobs, setAllJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  const fetchAll = async () => {
    try {
      const [statsRes, jobsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5005/api/admin/stats', { headers: authHeaders() }),
        axios.get('http://localhost:5005/api/admin/jobs', { headers: authHeaders() }),
        axios.get('http://localhost:5005/api/admin/users', { headers: authHeaders() })
      ]);
      const s = statsRes.data;
      setStats({
        totalFinders: s.total_finders || 0,
        totalPosters: s.total_posters || 0,
        totalJobs: s.total_jobs_posted || 0,
        totalApplications: s.total_applications || 0,
        pendingJobs: s.pending_jobs || 0,
        resumesUploaded: s.resumes_uploaded || 0,
        testsTaken: s.tests_taken || 0
      });
      setAllJobs(jobsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Admin fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    fetchAll();
  }, [token, navigate]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5005/api/admin/jobs/${id}/approve`, {}, { headers: authHeaders() });
      setAllJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'approved' } : j));
      setStats(prev => ({ ...prev, pendingJobs: prev.pendingJobs - 1 }));
      Swal.fire({ title: 'Job Approved!', icon: 'success', background: '#111', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (e) {}
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`http://localhost:5005/api/admin/jobs/${id}/reject`, {}, { headers: authHeaders() });
      setAllJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'rejected' } : j));
      setStats(prev => ({ ...prev, pendingJobs: prev.pendingJobs - 1 }));
    } catch (e) {}
  };

  const handleDeleteUser = async (id, role) => {
    if (role === 'admin') {
      Swal.fire({ title: 'Cannot delete admin user', icon: 'error', background: '#111', color: '#fff' });
      return;
    }
    const confirm = await Swal.fire({
      title: 'Delete User?', text: 'This cannot be undone.',
      icon: 'warning', showCancelButton: true,
      background: '#111', color: '#fff',
      confirmButtonColor: '#ef4444', cancelButtonColor: '#374151'
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`http://localhost:5005/api/admin/users/${id}`, { headers: authHeaders() });
      setUsers(prev => prev.filter(u => u.id !== id));
      Swal.fire({ title: 'User Deleted', icon: 'success', background: '#111', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ title: 'Delete Failed', text: e.response?.data?.error || 'Error', icon: 'error', background: '#111', color: '#fff' });
    }
  };

  const handleEditUser = async (user) => {
    const { value } = await Swal.fire({
      title: 'Edit User',
      background: '#0d1526', color: '#fff',
      html: `<input id="s-name" class="swal2-input" placeholder="Username" value="${user.username}">
             <input id="s-email" class="swal2-input" placeholder="Email" value="${user.email}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#7C3AED',
      preConfirm: () => ({
        username: document.getElementById('s-name').value,
        email: document.getElementById('s-email').value
      })
    });
    if (!value) return;
    try {
      const res = await axios.patch(`http://localhost:5005/api/admin/users/${user.id}`, value, { headers: authHeaders() });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...res.data } : u));
      Swal.fire({ title: 'Updated!', icon: 'success', background: '#111', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (e) {}
  };

  const handleAddUser = async () => {
    const { value } = await Swal.fire({
      title: 'Add New User',
      background: '#0d1526', color: '#fff',
      html: `<input id="s-name" class="swal2-input" placeholder="Username">
             <input id="s-email" class="swal2-input" placeholder="Email">
             <input id="s-pass" class="swal2-input" type="password" placeholder="Password">
             <select id="s-role" class="swal2-input" style="background:#1e293b;color:#fff">
               <option value="job_finder">Job Finder</option>
               <option value="job_poster">Job Poster</option>
             </select>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#7C3AED',
      preConfirm: () => ({
        username: document.getElementById('s-name').value,
        email: document.getElementById('s-email').value,
        password: document.getElementById('s-pass').value,
        role: document.getElementById('s-role').value
      })
    });
    if (!value || !value.username) return;
    try {
      const res = await axios.post('http://localhost:5005/api/admin/users', value, { headers: authHeaders() });
      setUsers(prev => [res.data.user, ...prev]);
      Swal.fire({ title: 'User Created!', icon: 'success', background: '#111', color: '#fff', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ title: 'Failed', text: e.response?.data?.error || 'Error', icon: 'error', background: '#111', color: '#fff' });
    }
  };

  const chartData = [
    { name: 'Mon', jobs: 12, apps: 45 }, { name: 'Tue', jobs: 19, apps: 52 },
    { name: 'Wed', jobs: 15, apps: 48 }, { name: 'Thu', jobs: 22, apps: 61 },
    { name: 'Fri', jobs: 30, apps: 75 }, { name: 'Sat', jobs: 10, apps: 20 },
    { name: 'Sun', jobs: 8, apps: 15 }
  ];

  const pendingJobs = allJobs.filter(j => j.status === 'pending');
  const roleBadge = (role) => {
    if (role === 'admin') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (role === 'job_poster') return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };
  const statusBadge = (s) => {
    if (s === 'approved') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (s === 'rejected') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <div className="w-72 bg-[#0d1526] border-r border-white/5 flex flex-col p-8 space-y-4 shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black italic shadow-purple-glow">NG</div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Control <span className="text-primary">Center</span></h2>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'jobs', icon: Briefcase, label: 'Job Moderation' },
            { id: 'users', icon: Users, label: 'User Management' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:bg-white/5'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { authLogout(); navigate('/login'); }}
          className="flex items-center gap-4 px-6 py-4 text-red-400 font-bold hover:bg-red-500/5 rounded-2xl transition-all text-sm">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-12 overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-1">
              {activeTab === 'overview' ? 'Platform Nexus' : activeTab === 'jobs' ? 'Job Moderation' : 'User Management'}
            </h1>
            <p className="text-muted font-medium italic">NextGen Hiring Admin Dashboard</p>
          </div>
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-muted relative cursor-pointer hover:text-white">
            <Bell size={24} />
            {pendingJobs.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617]"></span>}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : activeTab === 'overview' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Job Finders', value: stats.totalFinders, color: 'text-blue-400' },
                { label: 'Job Posters', value: stats.totalPosters, color: 'text-green-400' },
                { label: 'Total Jobs', value: stats.totalJobs, color: 'text-emerald-400' },
                { label: 'Applications', value: stats.totalApplications, color: 'text-purple-400' },
                { label: 'Pending Approval', value: stats.pendingJobs, color: 'text-red-400' },
                { label: 'Resumes Uploaded', value: stats.resumesUploaded, color: 'text-yellow-400' },
                { label: 'Tests Taken', value: stats.testsTaken, color: 'text-indigo-400' },
                { label: 'Total Users', value: stats.totalFinders + stats.totalPosters + 1, color: 'text-white' }
              ].map((s, i) => (
                <div key={i} className="glass-card p-6 border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">{s.label}</p>
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 glass-card p-10 border-white/5">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Growth Trajectory</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#0d1526', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="jobs" stroke="#7C3AED" fillOpacity={1} fill="url(#cg)" strokeWidth={3} />
                      <Area type="monotone" dataKey="apps" stroke="#3B82F6" fillOpacity={0} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-card p-8 border-white/5 flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center justify-between">
                  Pending Jobs <span className="text-[10px] bg-red-500/10 text-red-400 px-3 py-1 rounded-full">{pendingJobs.length}</span>
                </h3>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px]">
                  {pendingJobs.map(job => (
                    <div key={job.id} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-sm text-white">{job.title}</h4>
                          <p className="text-[10px] text-muted">{job.company} • {job.poster_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(job.id)} className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={14} /></button>
                          <button onClick={() => handleReject(job.id)} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><XCircle size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingJobs.length === 0 && <div className="text-center py-10 text-muted opacity-40 italic text-sm">Queue Clear</div>}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'jobs' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted">{allJobs.length} total jobs • {pendingJobs.length} pending</p>
            </div>
            <div className="space-y-4">
              {allJobs.map(job => (
                <div key={job.id} className="glass-card p-6 flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-black text-white text-lg">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusBadge(job.status)}`}>{job.status}</span>
                    </div>
                    <p className="text-muted text-sm">{job.company} • Posted by: <span className="text-white font-bold">{job.poster_name || 'Admin'}</span> • {job.applicant_count || 0} applicants</p>
                  </div>
                  {job.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleApprove(job.id)} className="px-5 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-bold text-xs hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"><CheckCircle size={14} /> Approve</button>
                      <button onClick={() => handleReject(job.id)} className="px-5 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"><XCircle size={14} /> Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted">{users.length} total users</p>
              <button onClick={handleAddUser} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/80 transition-all">
                <Plus size={16} /> Add User
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-muted">Name</th>
                    <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-muted">Email</th>
                    <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-muted">Role</th>
                    <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-muted">Joined</th>
                    <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-white">{user.username}</td>
                      <td className="p-5 text-muted text-sm">{user.email}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${roleBadge(user.role)}`}>{user.role}</span>
                      </td>
                      <td className="p-5 text-muted text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditUser(user)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteUser(user.id, user.role)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
