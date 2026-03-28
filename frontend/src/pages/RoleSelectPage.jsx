import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, login, isLoggedIn, authHeaders } from '../utils/auth';
import { User, Briefcase, ChevronRight, Zap, Target } from 'lucide-react';

const RoleSelectPage = () => {
  const token = getToken();
  const navigate = useNavigate();

  const handleRoleSelect = async (role) => {
    try {
      const res = await axios.post(
        'http://localhost:5005/api/auth/select-role',
        { role },
        { headers: authHeaders() }
      );
      login(res.data.token, res.data.user);
      
      if (role === 'job_poster') navigate('/poster');
      else navigate('/finder');
    } catch (err) {
      console.error('Role selection failed', err);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full animate-page-enter">
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-primary/10 rounded-3xl mb-6 border border-primary/20 shadow-purple-glow">
            <Zap size={32} className="text-primary fill-primary" />
          </div>
          <h2 className="text-5xl font-black tracking-tight text-white mb-4">Choose Your Path</h2>
          <p className="text-muted text-lg">Select the role that defines your journey on NextGen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RoleCard 
            icon={<Target size={40} className="text-primary" />}
            title="Job Finder"
            desc="I want to leverage AI to identify the perfect career opportunities and master mock interviews."
            onClick={() => handleRoleSelect('job_finder')}
            color="hover:border-primary/50"
            buttonClass="btn-gradient-purple"
          />
          <RoleCard 
            icon={<Briefcase size={40} className="text-secondary" />}
            title="Job Poster"
            desc="I want to post high-impact roles and find elite talent through AI-powered matching."
            onClick={() => handleRoleSelect('job_poster')}
            color="hover:border-secondary/50"
            buttonClass="bg-secondary hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          />
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ icon, title, desc, onClick, color, buttonClass }) => (
  <button 
    onClick={onClick}
    className={`glass-card p-10 text-left group relative overflow-hidden flex flex-col items-start ${color}`}
  >
    <div className="stat-accent opacity-20"></div>
    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-3xl font-black text-white mb-4">{title}</h3>
    <p className="text-muted leading-relaxed mb-10 text-lg">{desc}</p>
    
    <div className={`mt-auto w-full h-14 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 gap-2 ${buttonClass}`}>
      <span>Get Started</span>
      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

export default RoleSelectPage;
