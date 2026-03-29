import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout, isLoggedIn, authHeaders } from '../utils/auth';
import { LogOut, User, LayoutDashboard, Zap, Menu, Bell, X } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

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

  const handleUpdateProfile = () => {
    Swal.fire({
      title: 'Global Preferences',
      html: `
        <div class="space-y-6 pt-6 pb-2 text-left">
          <div class="group">
            <label class="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-3 block pl-2 group-focus-within:text-white transition-colors">Neural Identity</label>
            <input type="text" id="swal-global-username" class="swal2-input bg-[#1e293b]/50 text-white border-white/5 w-full m-0 px-6 rounded-[2rem] h-16 shadow-inner focus:border-white/20 focus:bg-[#1e293b]/80 transition-all" value="${user?.username || ''}" placeholder="E.g. jdoe_nexus">
          </div>
          <div class="group mt-6">
            <label class="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-3 block pl-2 group-focus-within:text-white transition-colors">Contact Protocol</label>
            <input type="email" id="swal-global-email" class="swal2-input bg-[#1e293b]/50 text-white border-white/5 w-full m-0 px-6 rounded-[2rem] h-16 shadow-inner focus:border-white/20 focus:bg-[#1e293b]/80 transition-all" value="${user?.email || ''}" placeholder="signal@domain.com">
          </div>
        </div>
      `,
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#fff',
      backdrop: 'rgba(0,0,0,0.6) backdrop-filter backdrop-blur-md',
      showCancelButton: true,
      confirmButtonText: 'Sync Coordinates',
      cancelButtonText: 'Abort',
      customClass: {
        popup: 'border border-white/10 rounded-[3rem] shadow-[0_0_50px_rgba(124,58,237,0.15)] w-[36rem]',
        confirmButton: 'btn-gradient-purple font-black uppercase tracking-widest text-xs rounded-[2rem] px-10 py-5 shadow-purple-glow hover:scale-105 transition-transform duration-300',
        cancelButton: 'bg-[#1e293b] hover:bg-[#334155] border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] px-10 py-5 ml-4 transition-colors'
      },
      preConfirm: () => {
        const username = document.getElementById('swal-global-username').value;
        const email = document.getElementById('swal-global-email').value;
        return { username, email };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put('http://localhost:5005/api/auth/profile', 
            result.value, 
            { headers: authHeaders() }
          );
          // Update the localized session so it reflects correctly
          if (res.data.token && res.data.user) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Sync Failed',
            text: err.response?.data?.error || 'Could not update profile',
            background: '#0f172a', color: '#fff'
          });
        }
      }
    });
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
                  <button 
                    onClick={handleUpdateProfile}
                    className="flex items-center space-x-3 pl-2 pr-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                      <User size={16} />
                    </div>
                    <span>{user.name || user.username}</span>
                  </button>
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
