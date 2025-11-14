import React from 'react';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';

const LandingPage = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/meritlogo.jpg" 
                alt="Merit College" 
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white font-bold">MC</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Merit College</h2>
                <p className="text-xs text-gray-600">Excellence in Education</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/auth')}
                className="px-5 py-2 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-50 transition-all"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/auth?register=true')}
                className="px-5 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Merit College of Basic<br/>and Advanced Studies
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Empowering minds, shaping futures through comprehensive O-Level, A-Level, and JAMB programs
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth?register=true')}
              className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/guest')}
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-full font-bold text-lg hover:bg-gray-50 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Expert Faculty"
            description="Learn from experienced educators dedicated to your success"
          />
          <FeatureCard 
            icon={<BookOpen className="w-8 h-8" />}
            title="Modern Resources"
            description="Access digital libraries and comprehensive study materials"
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8" />}
            title="Exam Excellence"
            description="Specialized preparation for WAEC, NECO, JAMB, IJMB & JUPEB"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="5000+" label="Students" />
            <StatCard number="200+" label="Faculty" />
            <StatCard number="95%" label="Success Rate" />
            <StatCard number="15+" label="Years" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Merit College of Advanced Studies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all transform hover:scale-105">
    <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ number, label }) => (
  <div className="transform hover:scale-110 transition-transform">
    <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{number}</div>
    <div className="text-gray-600 font-medium">{label}</div>
  </div>
);

export default LandingPage;