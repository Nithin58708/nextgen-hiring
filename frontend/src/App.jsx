import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

// Job Finder Pages
import JobFinderDashboard from './pages/JobFinderDashboard';
import JobFinderOverview from './pages/JobFinderOverview';
import UploadResume from './pages/UploadResume';
import JobList from './pages/JobList';
import JobMatchScore from './pages/JobMatchScore';
import ResumeSuggestions from './pages/ResumeSuggestions';
import MockTest from './pages/MockTest';
import TestResult from './pages/TestResult';
import ExternalJobs from './pages/ExternalJobs';
import MyApplications from './pages/MyApplications';

// Job Poster Pages
import JobPosterDashboard from './pages/JobPosterDashboard';
import PosterDashboard from './pages/PosterDashboard';
import PostJob from './pages/PostJob';
import MyJobPosts from './pages/MyJobPosts';

class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          color: '#ef4444',
          padding: '40px',
          backgroundColor: '#0f172a',
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
            Neural Link Severed: {this.state.error?.message}
          </h2>
          <pre style={{ 
            backgroundColor: 'rgba(0,0,0,0.3)', 
            padding: '20px', 
            borderRadius: '12px', 
            overflowX: 'auto',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Attempt Re-sync
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-dark flex flex-col selection:bg-primary/30">
            <Navbar />
            <main className="flex-grow pt-20">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Job Finder Routes */}
                <Route path="/finder" element={<ProtectedRoute allowedRoles={['job_finder']} />}>
                  <Route element={<JobFinderDashboard />}>
                    <Route index element={<JobFinderOverview />} />
                    <Route path="dashboard" element={<Navigate to="/finder" replace />} />
                    <Route path="upload" element={<UploadResume />} />
                    <Route path="jobs" element={<JobList />} />
                    <Route path="matching" element={<JobMatchScore />} />
                    <Route path="suggestions" element={<ResumeSuggestions />} />
                    <Route path="mock-test" element={<MockTest />} />
                    <Route path="test-result/:id" element={<TestResult />} />
                    <Route path="external" element={<ExternalJobs />} />
                    <Route path="applications" element={<MyApplications />} />
                  </Route>
                </Route>

                {/* Job Poster Routes */}
                <Route path="/poster" element={<ProtectedRoute allowedRoles={['job_poster']} />}>
                  <Route element={<JobPosterDashboard />}>
                    <Route index element={<PosterDashboard />} />
                    <Route path="dashboard" element={<Navigate to="/poster" replace />} />
                    <Route path="post-job" element={<PostJob />} />
                    <Route path="my-jobs" element={<MyJobPosts />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
