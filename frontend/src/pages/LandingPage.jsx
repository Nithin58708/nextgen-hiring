import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Github, 
  Linkedin, 
  Twitter 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen hero-gradient pt-20">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-8 animate-page-enter">
            <Zap size={14} className="fill-primary" />
            <span>The Future of Talent Acquisition</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white mb-8 animate-page-enter">
            Your AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-indigo-400">
              Career Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-12 animate-page-enter">
            NextGen Hiring uses advanced neural matching to connect elite talent with the world's most innovative companies. Upload your resume and let AI do the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-page-enter">
            <Link to="/register" className="btn-gradient-purple w-full sm:w-auto h-16 text-lg">
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-outline w-full sm:w-auto h-16 text-lg">
              Partner Login
            </Link>
          </div>
        </div>

        {/* Stats Floating Cards */}
        <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl animate-page-enter">
          <StatCard label="Jobs Matched" value="10k+" />
          <StatCard label="Accuracy" value="95%" />
          <StatCard label="Students" value="50k+" />
          <StatCard label="MNC Partners" value="200+" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-dark/50 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-4">Powerful AI Features</h2>
            <p className="text-muted text-lg">Everything you need to navigate the modern job market.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Zap size={32} />}
              title="AI Resume Analysis"
              desc="Our engine extracts hidden technical skills and technologies directly from your PDF profile."
            />
            <FeatureCard 
              icon={<Target size={32} />}
              title="Smart Job Matching"
              desc="Get instant match scores and strategic advice on how to optimize your profile for specific roles."
            />
            <FeatureCard 
              icon={<BarChart3 size={32} />}
              title="Mock Interviews"
              desc="Practice with AI-generated tests in a proctored environment with real-time performance feedback."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Zap size={24} className="text-primary fill-primary" />
              <span className="text-2xl font-black text-white">NextGen</span>
            </div>
            <p className="text-muted max-w-xs mb-8">
              Building the next generation of recruitment technology. Empowering millions through AI.
            </p>
            <div className="flex space-x-5 text-muted">
              <Twitter className="hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="hover:text-primary cursor-pointer transition-colors" />
              <Github className="hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-muted">
              <li className="hover:text-white cursor-pointer transition-colors">Job Search</li>
              <li className="hover:text-white cursor-pointer transition-colors">AI Insights</li>
              <li className="hover:text-white cursor-pointer transition-colors">Mock Tests</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-muted">
              <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-20 pt-10 border-t border-white/5 text-center text-muted text-sm">
          &copy; {new Date().getFullYear()} NextGen Hiring Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="glass-card p-8 flex flex-col items-center">
    <span className="text-4xl font-black text-white mb-2">{value}</span>
    <span className="text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-10 group hover:-translate-y-2 transition-all duration-500">
    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500 border border-primary/20">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-muted leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
