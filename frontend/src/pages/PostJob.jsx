import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';
import { Send, Briefcase, FileText, DollarSign, Plus, X, Loader2, Zap, Target } from 'lucide-react';
import Swal from 'sweetalert2';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    salary: '',
    location: '',
    required_skills: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post('http://localhost:5005/api/jobs', formData, {
        headers: authHeaders()
      });
      Swal.fire({
        title: 'Job Posted Successfully!',
        text: 'Pending admin approval. You will be notified once approved.',
        icon: 'success',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#3B82F6'
      });
      setFormData({
        title: '',
        company: '',
        description: '',
        salary: '',
        location: '',
        required_skills: []
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Initialization error. Please review input parameters.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-page-enter">
      <div className="text-left">
        <h2 className="text-4xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary border border-secondary/30 shadow-blue-glow">
            <Plus size={28} />
          </div>
          Initialize Opportunity
        </h2>
        <p className="text-muted text-lg">Define a new career vector to be analyzed by the AI matching engine.</p>
      </div>

      <div className="glass-card p-10 lg:p-16 relative overflow-hidden">
        <div className="stat-accent bg-secondary/10"></div>
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-4">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
                <input 
                  type="text" 
                  required 
                  className="input-field pl-14"
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-4">Salary Package</label>
              <div className="relative">
                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
                <input 
                  type="text" 
                  required 
                  className="input-field pl-14"
                  placeholder="e.g. 10-18 LPA"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-4">Company Name</label>
            <div className="relative">
              <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
              <input
                type="text"
                required
                className="input-field pl-14"
                placeholder="e.g. TechSolutions India"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-4">Location</label>
            <div className="relative">
              <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
              <input
                type="text"
                className="input-field pl-14"
                placeholder="e.g. Chennai"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-4">Job Description</label>
            <div className="relative">
              <FileText className="absolute left-5 top-6 text-muted" size={22} />
              <textarea 
                required 
                rows="6"
                className="input-field pl-14 pt-6 resize-none"
                placeholder="Describe the role, responsibilities and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-4">Technical Skill Core (Tags)</label>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
                <input 
                  type="text" 
                  className="input-field pl-14"
                  placeholder="Add skill (e.g. TensorFlow, AWS, Go)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
              </div>
              <button 
                type="button"
                onClick={handleAddSkill}
                className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-secondary transition-all"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {formData.required_skills.map((skill, i) => (
                <span key={i} className="px-5 py-2 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl font-bold flex items-center gap-3 group">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {formData.required_skills.length === 0 && (
                <span className="text-muted italic text-sm">No skills defined yet. Minimum 3 recommended for matching.</span>
              )}
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-3 text-muted">
                <Zap size={20} className="fill-muted/20" />
                <p className="text-xs font-medium">AI will analyze this posting to identify the top 5% of candidates.</p>
             </div>
             
             <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-12 h-16 bg-secondary hover:bg-blue-500 text-white font-black rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Finalize Posting <Send size={20} /></>}
              </button>
          </div>
        </form>
      </div>
      
      {message && (
        <div className={`p-6 rounded-3xl border flex items-center gap-4 animate-page-enter
          ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}
        `}>
          {message.type === 'success' ? <Zap size={24} /> : <X size={24} />}
          <span className="font-bold text-lg">{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default PostJob;
