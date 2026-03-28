import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout, isLoggedIn } from '../utils/auth';
import { LogOut, User, LayoutDashboard, Zap, Menu, Bell, X } from 'lucide-react';

const Navbar = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-dark/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-purple-glow group-hover:scale-110 transition-all duration-300">
              <Zap size={26} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              Next<span className="text-primary">Gen</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-10 font-medium">
            {user ? (
              <div className="flex items-center space-x-8">
                <button className="text-muted hover:text-white transition-colors relative">
                  <Bell size={22} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                </button>
                
                <div className="flex items-center space-x-5">
                  <Link 
                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'job_poster' ? '/poster' : '/finder'}
                    className="flex items-center space-x-3 pl-2 pr-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                      <User size={16} />
                    </div>
                    <span>{user.name || user.username}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-300"
                  >
                    <LogOut size={22} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-muted hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-gradient-purple">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark/95 backdrop-blur-2xl border-b border-white/10 p-8 animate-page-enter">
          <div className="flex flex-col space-y-8">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'job_poster' ? '/poster/dashboard' : '/finder/dashboard'} className="text-xl font-black text-white" onClick={() => setMobileMenu(false)}>Control Center</Link>
                <button onClick={() => { handleLogout(); setMobileMenu(false); }} className="text-xl font-black text-red-500 text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xl font-black text-white" onClick={() => setMobileMenu(false)}>Login</Link>
                <Link to="/register" className="btn-gradient-purple text-center py-4" onClick={() => setMobileMenu(false)}>Join the Future</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
