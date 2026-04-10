import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Plus, Users, MapPin, Mail, 
  Calendar, ExternalLink, TrendingUp, 
  Loader2, Briefcase 
} from 'lucide-react';
import { getToken, isLoggedIn, authHeaders } from '../utils/auth';
import GlassSelect from '../components/GlassSelect';

const PosterDashboard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('jobs');
    const token = getToken();

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/jobs/my-jobs', {
                headers: authHeaders()
            });
            setJobs(res.data || []);
        } catch (e) {}
    };

    const fetchApplicants = async (jobId) => {
        try {
            const res = await axios.get(`http://localhost:5005/api/jobs/${jobId}/applicants`, {
                headers: authHeaders()
            });
            setApplicants(res.data.applicants || []);
        } catch (e) {}
    };

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }
        const load = async () => {
            setLoading(true);
            await fetchJobs();
            setLoading(false);
        };
        load();
    }, [token, navigate]);

    const handleCreateJob = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Deploy New Role',
            background: '#0d1526',
            color: '#fff',
            html:
                '<input id="swal-input1" class="swal2-input input-field mb-3" style="width: 80%" placeholder="Job Title">' +
                '<input id="swal-input2" class="swal2-input input-field mb-3" style="width: 80%" placeholder="Company">' +
                '<input id="swal-input3" class="swal2-input input-field mb-3" style="width: 80%" placeholder="Location">' +
                '<input id="swal-input4" class="swal2-input input-field mb-3" style="width: 80%" placeholder="Salary Range">' +
                '<textarea id="swal-input5" class="swal2-textarea input-field mb-3 min-h-[100px] resize-none" style="width: 80%" placeholder="Description"></textarea>',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    title: document.getElementById('swal-input1').value,
                    company: document.getElementById('swal-input2').value,
                    location: document.getElementById('swal-input3').value,
                    salary: document.getElementById('swal-input4').value,
                    description: document.getElementById('swal-input5').value
                }
            }
        });

        if (formValues) {
            try {
                await axios.post('http://localhost:5005/api/jobs', formValues, {
                    headers: authHeaders()
                });
                Swal.fire('Success', 'Job vector initialized and awaiting admin verification.', 'success');
                fetchJobs();
            } catch (e) {
                Swal.fire('Error', 'Failed to commit job vector.', 'error');
            }
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`http://localhost:5005/api/jobs/applications/${id}/status`, { status }, {
                headers: authHeaders()
            });
            Swal.fire('Updated', `Applicant status set to ${status}`, 'success');
            fetchApplicants();
        } catch (e) {}
    };

    if (loading) return (
       <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="animate-spin text-primary mb-6" size={48} />
           <p className="text-muted font-black uppercase tracking-widest text-xs">Synchronizing Enterprise Grid...</p>
       </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 animate-page-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Talent Control</h1>
                    <p className="text-muted font-medium italic">Manage active requisitions and applicant flow.</p>
                </div>
                <button 
                  onClick={handleCreateJob}
                  className="btn-gradient-purple px-10 h-16 text-lg shadow-purple-glow"
                >
                    <Plus size={24} /> Initialize Requisition
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-12 border-b border-white/5 pb-1">
                <button 
                    onClick={() => setActiveTab('jobs')}
                    className={`px-8 py-4 font-black uppercase tracking-widest text-xs transition-all border-b-2 ${activeTab === 'jobs' ? 'border-primary text-white' : 'border-transparent text-muted hover:text-white'}`}
                >
                    Active Assets ({jobs.length})
                </button>
                <button 
                    onClick={() => setActiveTab('applicants')}
                    className={`px-8 py-4 font-black uppercase tracking-widest text-xs transition-all border-b-2 ${activeTab === 'applicants' ? 'border-primary text-white' : 'border-transparent text-muted hover:text-white'}`}
                >
                    Incoming Vectors ({applicants.length})
                </button>
            </div>

            {activeTab === 'jobs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map(job => (
                        <div key={job.id} className="glass-card p-8 group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                            <div className={`stat-accent opacity-10 ${job.status === 'approved' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary">
                                    <Briefcase size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    job.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                    job.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                    {job.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-white tracking-tight leading-tight mb-2">{job.title}</h3>
                            <p className="text-muted font-bold text-sm mb-6 flex items-center gap-2">
                                <MapPin size={14} className="text-primary" /> {job.location}
                            </p>

                            <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                <div className="text-xs text-muted font-bold">
                                    <span className="text-white">0</span> Applicants
                                </div>
                                <div className="text-emerald-400 font-black text-sm">{job.salary}</div>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center opacity-40 italic">
                            <Plus size={64} className="mb-4 text-primary" />
                            <p className="text-2xl">No requisitions deployed.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'applicants' && (
                <div className="space-y-6">
                    {applicants.map(app => (
                        <div key={app.id} className="glass-card p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 group transition-all hover:bg-white/[0.03]">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary border border-primary/30 shrink-0 shadow-purple-glow">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-2xl font-black text-white tracking-tight">{app.username}</h3>
                                        <span className="text-xs font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-lg">
                                            {app.job_title}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted font-medium">
                                        <span className="flex items-center gap-2 italic"><Mail size={16} className="text-primary" /> {app.email}</span>
                                        <span className="flex items-center gap-2 italic"><Calendar size={16} className="text-primary" /> Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full lg:w-auto mt-6 lg:mt-0">
                                <div className="flex-1 lg:flex-none">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 px-1">Current Status</p>
                                    <GlassSelect 
                                        value={app.status || 'pending'}
                                        onChange={(val) => updateStatus(app.id, val)}
                                        className="w-full lg:w-48"
                                        options={[
                                            { value: 'pending', label: 'Pending', colorClass: 'text-white' },
                                            { value: 'shortlisted', label: 'Shortlisted', colorClass: 'text-green-400' },
                                            { value: 'rejected', label: 'Rejected', colorClass: 'text-red-500' }
                                        ]}
                                    />
                                </div>
                                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-muted hover:text-white transition-all">
                                    <ExternalLink size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {applicants.length === 0 && (
                        <div className="py-40 flex flex-col items-center opacity-40 italic">
                            <TrendingUp size={64} className="mb-4 text-blue-400" />
                            <p className="text-2xl">No incoming talent signals detected.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PosterDashboard;
