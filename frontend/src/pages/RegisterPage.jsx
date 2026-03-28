import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '../utils/auth';
import { User, Mail, Lock, UserPlus, ArrowRight, Zap, AlertCircle, Briefcase, GraduationCap } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_finder');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5005/api/auth/register', { 
        username, 
        email, 
        password, 
        role 
      });
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'job_finder') navigate('/finder');
      else if (res.data.user.role === 'job_poster') navigate('/poster');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-[480px] animate-page-enter">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-purple-glow group-hover:rotate-12 transition-transform">
              <Zap size={26} className="text-white fill-white" />
            </div>
          </Link>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">Join NextGen</h2>
          <p className="text-muted">Start your journey into AI-driven hiring</p>
        </div>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="stat-accent bg-secondary/10"></div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm font-medium">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="flex p-1 bg-white/5 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole('job_finder')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${role === 'job_finder' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white'}`}
              >
                <GraduationCap size={18} />
                <span className="text-sm font-bold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('job_poster')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${role === 'job_poster' ? 'bg-secondary text-white shadow-lg' : 'text-muted hover:text-white'}`}
              >
                <Briefcase size={18} />
                <span className="text-sm font-bold">Employer</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="text" 
                  required 
                  className="input-field pl-12"
                  placeholder="Karthi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="email" 
                  required 
                  className="input-field pl-12"
                  placeholder="karthi@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="password" 
                  required 
                  className="input-field pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-gradient-purple w-full h-14 text-base tracking-wide mt-4"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-muted">
          Already have an account? {' '}
          <Link to="/login" className="font-bold text-white hover:text-primary transition-colors underline decoration-primary underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
