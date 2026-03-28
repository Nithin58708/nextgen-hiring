import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';
import { Target, Info, Loader2, ChevronLeft, CheckCircle2, Zap, ArrowUpRight, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const JobMatchScore = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const getScore = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5005/api/match/${jobId}`, {}, {
        headers: authHeaders()
      });
      setMatchData(res.data);
    } catch (err) {
      console.error('Failed to get match score', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    getScore();
  }, [jobId, token, navigate]);

  const data = matchData ? [
    { name: 'Match', value: matchData.score },
    { name: 'Gap', value: 100 - matchData.score },
  ] : [];

  const COLORS = ['#7C3AED', 'rgba(255,255,255,0.05)'];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-enter">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-3 text-muted hover:text-white transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Return to Board</span>
      </button>

      <div className="glass-card p-12 lg:p-20 relative overflow-hidden">
        <div className="stat-accent opacity-30"></div>
        
        <div className="text-center mb-20 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 border border-primary/20">
            <Zap size={12} className="fill-primary" />
            <span>Neural Match Extraction</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4">AI Match Analytics</h2>
          <p className="text-muted text-xl max-w-2xl mx-auto font-medium">Quantifying the synergy between your professional vector and the target role.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-24 h-24 border-4 border-white/5 border-t-primary rounded-full animate-spin mb-10"></div>
            <p className="text-muted font-black border-l-2 border-primary pl-4 uppercase tracking-[0.4em] text-xs">Synchronizing Neural Weights...</p>
          </div>
        ) : matchData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            {/* Visualizer */}
            <div className="relative aspect-square max-w-[400px] mx-auto w-full">
              {/* Spinning Glow Layer */}
              <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse"></div>
              
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius="75%"
                    outerRadius="100%"
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
                  {matchData.score}<span className="text-4xl opacity-40">%</span>
                </span>
                <span className="text-xs font-black text-muted uppercase tracking-[0.4em] mt-2 translate-x-2">Compatibility</span>
              </div>
            </div>

            {/* Insight Block */}
            <div className="space-y-12">
              <div className="glass-card p-10 bg-white/5 border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Info size={24} className="text-primary" />
                  <h3 className="text-2xl font-black text-white italic tracking-tight">AI Semantic Analysis</h3>
                </div>
                <p className="text-muted text-xl leading-relaxed font-medium">
                  "{matchData.reasoning}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => navigate(`/finder/suggestions?jobId=${jobId}`)}
                  className="btn-gradient-purple flex-1 h-16 text-lg"
                >
                  Improve Vector <ArrowUpRight size={20} />
                </button>
                <button className="btn-outline flex-1 h-16 text-lg">
                  Full Description
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-40">
             <div className="w-20 h-20 bg-white/5 rounded-3xl mb-8 flex items-center justify-center text-muted">
               <AlertCircle size={40} />
             </div>
             <h3 className="text-2xl font-black text-white mb-2">Insufficient Data</h3>
             <p className="text-muted max-w-sm">Please ensure a valid resume intelligence scan exists for your profile before initiating match analytics.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatchScore;
