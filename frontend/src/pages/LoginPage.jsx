import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '../utils/auth';
import { User, Lock, LogIn, ArrowRight, Zap, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Save correctly using centralized auth utility
      login(data.token, data.user);
      
      // Navigate based on role
      const role = data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'job_poster') navigate('/poster');
      else navigate('/finder');
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Server not reachable. Check if backend is running on port 5005.');
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
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">Neural Access</h2>
          <p className="text-muted">Enter your username to uplink to the network</p>
        </div>

        <div className="glass-card p-10 relative overflow-hidden">
          <div className="stat-accent"></div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm font-medium">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="text" 
                  required 
                  className="input-field pl-12"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <label className="block text-xs font-black uppercase tracking-widest text-muted">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:text-white transition-colors">Forgot Password?</a>
              </div>
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
              className="btn-gradient-purple w-full h-14 text-base font-bold tracking-wide"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Synchronizing...</span>
                </div>
              ) : (
                <>
                  <span>Initialize Link</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-muted">
          New neural signature? {' '}
          <Link to="/register" className="font-bold text-white hover:text-primary transition-colors underline decoration-primary underline-offset-4">
            Register identity
          </Link>
        </p>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <Link to="/admin/login" className="text-xs font-black uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors">
            Security & Administration Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
