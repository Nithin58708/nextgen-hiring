import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser, isLoggedIn, authHeaders, parseSkills } from '../utils/auth';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plus, 
  X, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import Swal from 'sweetalert2';

const UploadResume = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState(null);
  const user = getUser();
  const token = getToken();

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5005/api/resume/profile', {
        headers: authHeaders()
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('http://localhost:5005/api/resume/upload', formData, {
        headers: { 
          ...authHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      Swal.fire({
        title: 'Intelligence Sync Complete',
        text: 'Neural skill extraction was successful. Your profile is now optimized.',
        icon: 'success',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#7C3AED'
      });
      fetchProfile();
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Neural extraction failed. Check backend logs.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-enter">
      <div className="text-left">
        <h2 className="text-4xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30">
            <FileText size={28} />
          </div>
          Resume Intelligence
        </h2>
        <p className="text-muted text-lg">Upload your PDF resume to initialize deep skill extraction and job matching.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Upload Terminal */}
        <div className="lg:col-span-3">
          <form onSubmit={handleUpload} className="space-y-8">
            <div className={`relative group border-2 border-dashed rounded-[2.5rem] p-16 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden
              ${file ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 bg-dark-card'}
            `}>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              
              <div className="relative z-10">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-all duration-500
                  ${file ? 'bg-primary text-white shadow-purple-glow' : 'bg-white/5 text-muted group-hover:bg-primary/20 group-hover:text-primary'}
                `}>
                  {file ? <CheckCircle size={40} /> : <Upload size={40} />}
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2">
                  {file ? file.name : "Drop Resume Here"}
                </h3>
                <p className="text-muted text-sm font-medium">Support for text-based PDF resumes &bull; Max 5MB</p>
                
                {file && (
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                    className="mt-6 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove File
                  </button>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !file}
              className="btn-gradient-purple w-full h-16 text-lg font-black group overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Neural Processing Hub...</span>
                </div>
              ) : (
                <>
                  <Zap size={20} className="fill-white" />
                  <span>Execute AI Scan</span>
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-8 p-6 rounded-3xl border flex items-center gap-4 animate-page-enter
              ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}
            `}>
              {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
              <span className="font-bold text-lg">{message.text}</span>
            </div>
          )}
        </div>

        {/* AI Insight Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-10 h-full relative overflow-hidden">
            <div className="stat-accent opacity-30"></div>
            
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
              <ShieldCheck className="text-primary" /> Extraction Results
            </h3>

            {profile?.extracted_skills ? (
              <div className="space-y-10 relative z-10">
                <SkillSection title="Technical Expertise" items={parseSkills(profile.extracted_skills)} color="primary" />
                <SkillSection title="Identified Role" items={[profile.primary_job_role]} color="indigo" />
                <SkillSection title="Main Language" items={[profile.primary_language]} color="secondary" />
                
                <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                  <span>Last Sync Success</span>
                  <span>{new Date(profile.updated_at || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-muted mb-6 border border-white/10">
                  <Zap size={32} />
                </div>
                <p className="text-muted font-bold tracking-tight italic">
                  Neural core is idle. <br /> Initialize scan to extract profile vectors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillSection = ({ title, items, color }) => (
  <div>
    <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full bg-${color}`}></div>
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">
      {items?.length > 0 ? items.map((skill, i) => (
        <span key={i} className={`px-4 py-1.5 bg-dark border border-white/10 text-white rounded-lg text-xs font-bold transition-all hover:border-primary/50 hover:bg-primary/5`}>
          {skill}
        </span>
      )) : <span className="text-muted italic text-xs">No data identified</span>}
    </div>
  </div>
);

export default UploadResume;
