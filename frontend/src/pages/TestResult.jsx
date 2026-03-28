import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';
import { 
  Trophy, TrendingUp, AlertTriangle, 
  BookOpen, Target, ChevronRight, 
  Download, Share2, Star, Zap, 
  ShieldCheck, Loader2, ArrowUpRight,
  PlusCircle, Book, XCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TestResult = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const fetchResult = async () => {
      try {
        const res = await axios.get(`http://localhost:5005/api/assessments/result/${id}`, {
          headers: authHeaders()
        });
        setData(res.data.result || res.data);
      } catch (err) {
        console.error('Failed to fetch result', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, token, navigate]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary mb-6" size={48} />
        <p className="text-muted font-black uppercase tracking-widest text-xs">Parsing Neural Performance Data...</p>
    </div>
  );

  if (!data) return (
    <div className="text-center py-40">
        <p className="text-white text-xl">Assessment cycle not found.</p>
        <button onClick={() => navigate('/finder')} className="mt-6 btn-gradient-purple px-8 py-3">Return to Core</button>
    </div>
  );

  const feedback = typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback;
  const chartData = [
    { name: 'Score', value: data.score },
    { name: 'Remaining', value: 100 - data.score }
  ];
  const COLORS = ['#7C3AED', 'rgba(255,255,255,0.05)'];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-page-enter px-4 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Performance Analytics</h1>
          <p className="text-muted italic">Assessment Token: {id?.substring(0,8)}...{id?.substring(id.length-4)}</p>
        </div>
        <div className="flex gap-4">
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-muted hover:text-white transition-all"><Share2 size={20}/></button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-muted hover:text-white transition-all"><Download size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Score Card */}
        <div className="lg:col-span-1 glass-card p-10 relative overflow-hidden flex flex-col items-center text-center">
            <div className="stat-accent opacity-20"></div>
            <div className="relative w-64 h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius="75%"
                            outerRadius="100%"
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-black text-white">{data.score}%</span>
                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Neural Efficiency</span>
                </div>
            </div>
            
            <div className="w-full space-y-6 relative z-10">
                <div className={`py-4 rounded-2xl border font-black uppercase tracking-widest text-sm ${
                    data.score >= 70 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                    data.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                    'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    Status: {feedback?.overallGrade || 'PROCESSED'}
                </div>
                <p className="text-muted font-medium italic">"{feedback?.scoreInterpretation}"</p>
            </div>
        </div>

        {/* Detailed Insights */}
        <div className="lg:col-span-2 space-y-10">
            <div className="glass-card p-10">
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                    <Zap className="text-yellow-500" size={24} /> 
                    AI Critical Feedback
                </h3>
                <p className="text-muted text-lg leading-relaxed">{feedback?.feedbackSummary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-3 text-green-400 font-black uppercase tracking-widest text-xs">
                            <ShieldCheck size={16} /> Strong Nodes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {feedback?.strongAreas?.map((s,i) => (
                                <span key={i} className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[11px] font-bold">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-3 text-red-400 font-black uppercase tracking-widest text-xs">
                            <AlertTriangle size={16} /> Weak Nodes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {feedback?.weakAreas?.map((s,i) => (
                                <span key={i} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-bold">{s}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 bg-primary/10 border-primary/20">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <TrendingUp size={20} className="text-primary" /> Roadmap Impact
                    </h3>
                    <p className="text-sm text-muted mb-8">This assessment has updated your personalized learning roadmap with new modules based on detected gaps.</p>
                    <Link to="/finder/suggestions" className="btn-gradient-purple w-full h-12 flex items-center justify-center gap-2">
                        View Updated Roadmap <ArrowUpRight size={18}/>
                    </Link>
                </div>
                <div className="glass-card p-8 bg-blue-500/10 border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Target size={20} className="text-blue-400" /> Market Fit
                    </h3>
                    <p className="text-sm text-muted mb-8">Verify how this performance aligns with your target job openings.</p>
                    <Link to="/finder/board" className="w-full h-12 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-blue-500/10 transition-all">
                        Check Compatibility <XCircle size={18} className="rotate-45" />
                    </Link>
                </div>
            </div>
        </div>
      </div>

      <div className="glass-card p-10">
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
              <BookOpen className="text-blue-400" size={24} /> 
              Immediate Action Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {feedback?.nextSteps?.map((step, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 font-black">
                          {i+1}
                      </div>
                      <p className="text-sm text-white/80 font-medium">{step}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default TestResult;
