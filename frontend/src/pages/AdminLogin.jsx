import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { login } from '../utils/auth';
import { ShieldAlert, Lock, Mail, ChevronLeft, Zap, ArrowRight, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5005/api/auth/login', { username: email, password });
      
      if (res.data.user.role !== 'admin') {
        setError('Unauthorized: You do not have admin privileges');
        return;
      }

      login(res.data.token, res.data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-[480px] animate-page-enter">
        <Link 
          to="/login"
          className="inline-flex items-center space-x-2 text-muted hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to User Login</span>
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl text-red-500 mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">Admin Portal</h2>
          <p className="text-muted text-sm uppercase tracking-widest font-bold">Secure Access Environment</p>
        </div>

        <div className="glass-card p-10 border-red-500/10 relative overflow-hidden">
          <div className="stat-accent bg-red-500/5"></div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm font-medium relative z-10">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Admin Credential</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="email" 
                  required 
                  className="input-field pl-12"
                  placeholder="admin@nextgen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Security Key</label>
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
              className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all duration-300 shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] active:scale-95 flex items-center justify-center space-x-3 tracking-widest uppercase text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldAlert size={18} />
                  <span>Secure Entry</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-12 text-center text-muted">
           <Zap size={20} className="mx-auto mb-4 opacity-20" />
           <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-40">NextGen System Administration &bull; Version 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
