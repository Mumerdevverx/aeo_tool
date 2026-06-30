import './App.css'
import { useState, useRef } from 'react';
import UrlForm from './components/toolone/UrlForm';
import GradeCard from './components/toolone/GradeCard';
import ProblemsList from './components/toolone/ProblemsList';
import EmailGate from './components/toolone/EmailGate';
import { checkWebsite } from './components/services/websiteChecker';
import ReportDownload from './components/toolone/ReportDownload';

function App() {
  const [url, setUrl] = useState('');
  const [grade, setGrade] = useState('');
  const [score, setScore] = useState(0); // ✅ REAL score from websiteChecker
  const [problems, setProblems] = useState([]);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailGateRef = useRef(null);

  const handleEmailSubmit = (submittedEmail) => {
    setEmail(submittedEmail);
    setEmailSubmitted(true);
    setShowEmailGate(false);
  };

  const showEmailGateAndScroll = () => {
    setShowEmailGate(true);
    setTimeout(() => {
      emailGateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCheck = async (submittedUrl) => {
    setLoading(true);
    setUrl(submittedUrl);
    
    const result = await checkWebsite(submittedUrl);
    
    // ✅ Store REAL data from websiteChecker
    setGrade(result.grade);
    setScore(result.score); // REAL score from websiteChecker
    setProblems(result.problems);
    setShowEmailGate(true);
    setLoading(false);
  };

  // ✅ Same filter as ProblemsList - counts ONLY real issues
  const getRealIssueCount = (problemList) => {
    return problemList.filter(p => {
      const lower = p.toLowerCase();
      
      // Exclude summary messages
      if (lower.includes('excellent website performance') ||
          lower.includes('good performance with minor improvements') ||
          lower.includes('moderate issues found') ||
          lower.includes('significant issues found') ||
          lower.includes('critical issues found') ||
          lower.includes('perfect score') ||
          lower.includes('minor issues found') ||
          lower.includes('all checks passed')) {
        return false;
      }
      
      // Exclude Pass items (✅)
      if (lower.includes('✅') ||
          lower.includes('valid') && lower.includes('ssl') ||
          lower.includes('fast loading') ||
          (lower.includes('enabled') && !lower.includes('not enabled')) ||
          lower.includes('good') ||
          lower.includes('detected') ||
          lower.includes('perfect') ||
          lower.includes('excellent') ||
          lower.includes('great') ||
          lower.includes('successful') ||
          (lower.includes('all') && lower.includes('alt text')) ||
          lower.includes('compression is enabled') ||
          lower.includes('dns resolution successful') ||
          lower.includes('trusted domain extension')) {
        return false;
      }
      
      return true;
    }).length;
  };

  const realIssueCount = getRealIssueCount(problems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Free Website Auditor's
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Enter your website URL to get an <span className="font-semibold">A–F grade</span> and a <span className="font-semibold">detailed fix list</span>
          </p>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left Column - URL Form & Audit Preview */}
          <div className="space-y-6 min-w-0">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                Website URL
              </h2>
              <UrlForm onSubmit={handleCheck} loading={loading} />
            </div>

            {/* Audit Preview Cards - Only show when grade exists */}
            {grade && (
              <>
                <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-100">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Audit Preview
                  </h2>
                  <div className="space-y-4">
                    <GradeCard grade={grade} />
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500">Total Checks</p>
                          <p className="text-2xl font-bold text-gray-800">{problems.length}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500">Issues to Fix</p>
                          <p className={`text-2xl font-bold ${realIssueCount === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            {realIssueCount}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm col-span-2">
                          <p className="text-xs text-gray-500">Real Score</p>
                          <p className="text-2xl font-bold text-blue-600">{score}/100</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Audit Summary */}
          <div className="min-w-0">
            <div className="space-y-6">
              {grade ? (
                <>
                  <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-100">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                      </span>
                      Audit Summary
                    </h2>
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-blue-700 font-medium">Grade</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{grade}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-purple-700 font-medium">Issues</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">{realIssueCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-green-700 font-medium">Score</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{score}</p>
                      </div>
                    </div>

                    {/* Problems List */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Detailed Issues</h3>
                      <div className="max-h-136 overflow-y-auto pr-2 custom-scrollbar">
                        <ProblemsList problems={problems} />
                      </div>
                    </div>
                  </div>
                  
                </>
                
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Audit Yet</h3>
                    <p className="text-gray-500">Enter a URL on the left to see your audit summary here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* ReportDownload - Pass REAL score */}
        {grade && (
          <ReportDownload 
            url={url} 
            grade={grade} 
            score={score}  // ✅ REAL score passed
            problems={problems} 
            email={email} 
            onRequestEmail={showEmailGateAndScroll} 
          />
        )}
        
        {/* Email Section - Below both columns */}
        {grade && (
          <div className="mt-8" ref={emailGateRef}>
            {!showEmailGate ? (
              <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center w-full sm:w-auto">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Get Your Full Report</h3>
                      <p className="text-gray-600 text-sm truncate">Enter your email to receive the complete audit report</p>
                    </div>
                  </div>
                  <button
                    onClick={showEmailGateAndScroll}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg whitespace-nowrap"
                  >
                  Continue to Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-100">
                <EmailGate
                  url={url}
                  grade={grade}
                  problems={problems}
                  email={email}
                  emailSubmitted={emailSubmitted}
                  onEmailSubmit={handleEmailSubmit}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
          <p>© 2024 DevVerx — Free Website Auditor. All checks are simulated for demo purposes.</p>
        </footer>
        
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c4c4c4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default App;