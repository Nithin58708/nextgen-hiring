import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, getUser, isLoggedIn, authHeaders } from '../utils/auth';
import { 
  AlertTriangle, 
  Clock, 
  Send, 
  ShieldCheck, 
  Loader2, 
  Zap, 
  Target, 
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ChevronRight,
  Code2,
  Terminal,
  Play
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import Swal from 'sweetalert2';

const MockTest = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'Software Engineer';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [assessmentId, setAssessmentId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  
  const token = getToken();
  const user = getUser();
  const navigate = useNavigate();


  const handleSubmit = useCallback(async () => {
    if (!assessmentId) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`http://localhost:5005/api/assessments/${assessmentId}/submit`, {
        role,
        answers: Object.entries(answers).map(([idx, ans]) => ({
          questionId: questions[parseInt(idx)]?.id,
          selectedAnswer: ans
        })),
        tabSwitches
      }, {
        headers: authHeaders()
      });
      localStorage.setItem('testJustCompleted', 'true');
      // result ID comes from assessment_results table
      const resultId = res.data.resultId || res.data.id || assessmentId;
      navigate(`/finder/test-result/${resultId}`);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setSubmitting(false);
    }
  }, [assessmentId, role, answers, tabSwitches, token, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const startAssessment = async () => {
        try {
            const res = await axios.post('http://localhost:5005/api/assessments/generate', { jobRole: role }, {
                headers: authHeaders()
            });
            setQuestions(res.data.questions);
            setAssessmentId(res.data.id);
            setLoading(false);
        } catch (err) {
            console.error('Failed to generate assessment', err);
            Swal.fire('Error', 'Neural node generation failed.', 'error').then(() => navigate(-1));
        }
    };
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    startAssessment();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        Swal.fire({
            title: 'Security Warning',
            text: 'Tab switching is strictly prohibited.',
            icon: 'warning',
            background: '#111',
            color: '#fff',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timer);
    };
  }, [handleSubmit]);

  useEffect(() => {
    if (tabSwitches >= 3) {
      Swal.fire({
        title: 'Security Violation',
        text: 'Maximum tab switches reached. Auto-submitting assessment.',
        icon: 'error',
        background: '#111',
        color: '#fff'
      }).then(() => handleSubmit());
    }
  }, [tabSwitches, handleSubmit]);

  useEffect(() => {
    const blockContext = (e) => e.preventDefault();
    const blockCopyPaste = (e) => e.preventDefault();
    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('copy', blockCopyPaste);
    document.addEventListener('paste', blockCopyPaste);
    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('copy', blockCopyPaste);
      document.removeEventListener('paste', blockCopyPaste);
    };
  }, []);

  const [codeByQuestion, setCodeByQuestion] = useState({});
  const [compilerResults, setCompilerResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

    const handleAnswer = (questionId, index) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: index }));
  };

  const runCode = async (questionId, language) => {
    const code = codeByQuestion[questionId] || questions[currentIdx]?.starterCode || '';
    if (!code.trim()) return;
    setIsRunning(true);
    try {
      const response = await fetch('http://localhost:5005/api/compiler/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ code, language })
      });
      const result = await response.json();
      setCompilerResults(prev => ({ ...prev, [questionId]: result }));
    } catch (err) {
      setCompilerResults(prev => ({ 
        ...prev, 
        [questionId]: { 
          success: false, 
          errorType: 'NETWORK_ERROR',
          errorMessage: 'Could not connect to compiler. Check your connection.' 
        }
      }));
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center space-y-8">
      <div className="w-20 h-20 border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted font-black tracking-[0.4em] text-xs">Initializing High-Security Assessment Lab...</p>
    </div>
  );

  const currentQ = questions[currentIdx];
  const isCoding = currentQ?.isCompilable;
  const primaryLanguage = role?.toLowerCase()?.includes('java') ? 'java' : 'javascript';

  return (
    <div className="min-h-screen bg-dark fixed inset-0 z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-dark/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-widest uppercase">{role} Elite Assessment</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-muted font-bold tracking-widest uppercase">Live Proctoring Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-2.5 rounded-xl border border-white/10">
            <Clock size={16} className="text-primary" />
            <span className={`text-xl font-black tabular-nums ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="group flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="group-hover:translate-x-1 transition-transform" />}
            Finalize Submission
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-dark/50 border-r border-white/5 overflow-y-auto p-6 scrollbar-hide">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Question Matrix</p>
            <div className="grid grid-cols-4 gap-3">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-12 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                    currentIdx === i ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                    answers[i] !== undefined ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                    'bg-white/5 text-muted hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-10 p-5 glass-card bg-red-500/5 border-red-500/20">
             <div className="flex items-center gap-3 text-red-500 mb-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase">Violations</span>
             </div>
             <p className="text-2xl font-black text-white">{tabSwitches} <span className="text-xs text-muted">/ 3</span></p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.05),transparent)]">
          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {currentQ && (
              <div className="max-w-4xl mx-auto space-y-10 animate-page-enter">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-muted tracking-widest">
                    Question {currentIdx + 1} / {questions.length}
                  </span>
                  <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase text-primary tracking-widest">
                    {currentQ.category}
                  </span>
                </div>

                <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                  {currentQ.question}
                </h2>

                {currentQ.hasCode && !currentQ.isCompilable && (
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 font-mono text-sm text-green-400 overflow-x-auto">
                    <pre>{currentQ.codeSnippet}</pre>
                  </div>
                )}

                {currentQ.isCompilable ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-black uppercase border border-primary/30">
                        {currentQ.category?.toUpperCase() || 'CODE'}
                      </span>
                      <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                        Language: {primaryLanguage.toUpperCase()}
                      </span>
                    </div>

                    <div className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="bg-[#0d1117] px-6 py-3 border-b border-white/5 flex justify-between items-center">
                        <span className="text-muted text-[10px] font-bold tracking-widest uppercase">Solution Workspace</span>
                        <button
                          onClick={() => setCodeByQuestion(prev => ({ ...prev, [currentQ.id]: currentQ.starterCode || '' }))}
                          className="text-[10px] font-bold text-muted hover:text-white uppercase transition-colors"
                        >
                          Reset to starter
                        </button>
                      </div>
                      <textarea
                        value={codeByQuestion[currentQ.id] || currentQ.starterCode || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCodeByQuestion(prev => ({ ...prev, [currentQ.id]: val }));
                          // Also store in answers for final submission
                          setAnswers(prev => ({ ...prev, [currentIdx]: val }));
                        }}
                        className="w-full min-h-[300px] bg-[#0d1117] text-green-400 font-mono text-sm p-8 outline-none resize-y"
                        spellCheck={false}
                        placeholder={`// Write your ${primaryLanguage} code here...`}
                      />
                    </div>

                    <button
                      onClick={() => runCode(currentQ.id, primaryLanguage)}
                      disabled={isRunning}
                      className="flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                      Run Execution Sequence
                    </button>

                    {compilerResults[currentQ.id] && (
                      <div className={`p-6 rounded-2xl border ${compilerResults[currentQ.id].success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className={`flex items-center gap-3 mb-4 font-black uppercase text-xs tracking-widest ${compilerResults[currentQ.id].success ? 'text-green-400' : 'text-red-400'}`}>
                          {compilerResults[currentQ.id].success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          {compilerResults[currentQ.id].success ? '✅ Ran Successfully' : 
                            compilerResults[currentQ.id].errorType === 'COMPILATION_ERROR' ? '❌ Compilation Error' : 
                            compilerResults[currentQ.id].errorType === 'NETWORK_ERROR' ? '⚠️ Network Error' : '❌ Runtime Error'}
                          {compilerResults[currentQ.id].executionTime && (
                             <span className="opacity-50 lowercase font-normal ml-auto">({compilerResults[currentQ.id].executionTime}s)</span>
                          )}
                        </div>
                        {compilerResults[currentQ.id].lineNumber && (
                          <div className="bg-red-500/20 text-red-100 text-[10px] font-bold px-3 py-1 rounded inline-block mb-3">
                            Error at Line {compilerResults[currentQ.id].lineNumber}
                          </div>
                        )}
                        <pre className="font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                          {compilerResults[currentQ.id].success ? compilerResults[currentQ.id].output : compilerResults[currentQ.id].errorMessage}
                        </pre>
                      </div>
                    )}

                    {currentQ.expectedOutput && (
                       <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                          <Zap size={14} className="text-yellow-500" />
                          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Expected Output:</span>
                          <code className="text-[10px] font-mono text-white/60">{currentQ.expectedOutput}</code>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {currentQ.options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(currentQ.id, i)}
                        className={`group p-6 rounded-2xl text-left transition-all border flex items-center gap-5 ${
                          answers[currentIdx] === i 
                          ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' 
                          : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all ${
                          answers[currentIdx] === i ? 'bg-primary text-white' : 'bg-dark text-muted group-hover:bg-primary/20'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-lg font-bold">{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="h-24 bg-dark/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-12 shrink-0">
             <button 
               onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
               disabled={currentIdx === 0}
               className="flex items-center gap-2 text-muted font-bold uppercase text-xs tracking-widest hover:text-white disabled:opacity-30"
             >
                <ChevronRight size={16} className="rotate-180" /> Previous Unit
             </button>

             {currentIdx < questions.length - 1 ? (
               <button 
                 onClick={() => setCurrentIdx(prev => prev + 1)}
                 className="flex items-center gap-5 bg-white text-dark px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-xl"
               >
                  Advance Sequence <ChevronRight size={18} />
               </button>
             ) : (
               <button 
                 onClick={handleSubmit}
                 className="flex items-center gap-5 bg-green-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all transform active:scale-95 shadow-xl shadow-green-500/20"
               >
                  Commit All Answers <Send size={18} />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTest;
