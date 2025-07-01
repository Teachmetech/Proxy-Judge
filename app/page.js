'use client'

import { useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/check');
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Failed to fetch data' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse-slow">
            Proxy Judge
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Analyze your proxy connection and get detailed information about anonymity level, location, and performance.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* API Information Card */}
          <div className="glass-dark rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">API Endpoint</h2>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700">
              <code className="text-green-400 font-mono text-lg">/api/check</code>
            </div>
            
            <p className="text-blue-200 mb-6 text-lg">
              Make a GET request to this endpoint to receive comprehensive proxy analysis data.
            </p>
            
            <button 
              onClick={testEndpoint} 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </div>
              ) : (
                'Test Endpoint'
              )}
            </button>
          </div>

          {/* Response Format Card */}
          <div className="glass-dark rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Response Format</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-blue-400 font-mono font-semibold">PROXY_COUNTRY:</span>
                  <span className="text-gray-300 ml-2">ISO country code (e.g., "ES", "US")</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-purple-400 font-mono font-semibold">PROXY_CITY:</span>
                  <span className="text-gray-300 ml-2">City name (e.g., "Madrid", "New York")</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-green-400 font-mono font-semibold">PROXY_ANONYMITY:</span>
                  <span className="text-gray-300 ml-2">Level - "TRANSPARENT", "ANONYMOUS", or "ELITE"</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-yellow-400 font-mono font-semibold">REQUEST_TIME_FLOAT:</span>
                  <span className="text-gray-300 ml-2">Precise timestamp with decimals</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <span className="text-pink-400 font-mono font-semibold">REQUEST_TIME:</span>
                  <span className="text-gray-300 ml-2">Integer timestamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="mt-8 w-full max-w-4xl animate-fade-in">
            <div className="glass-dark rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                API Response
              </h3>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Usage Examples */}
        <div className="mt-12 w-full max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-white mb-8">
            Usage Examples
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* cURL Example */}
            <div className="glass-dark rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                cURL
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <code className="text-green-400 font-mono text-sm break-all">
                  curl https://your-domain.vercel.app/api/check
                </code>
              </div>
            </div>

            {/* JavaScript Example */}
            <div className="glass-dark rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JavaScript
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <code className="text-green-400 font-mono text-sm">
                  fetch('/api/check')<br/>
                  &nbsp;&nbsp;.then(r =&gt; r.json())
                </code>
              </div>
            </div>

            {/* Python Example */}
            <div className="glass-dark rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Python
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <code className="text-green-400 font-mono text-sm">
                  import requests<br/>
                  requests.get(url)
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
} 