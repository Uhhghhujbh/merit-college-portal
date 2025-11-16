import React, { useState, useEffect } from 'react';

// Import all components
import WelcomeAnimation from './components/shared/WelcomeAnimation';
import LandingPage from './components/shared/LandingPage';
import AuthPage from './components/auth/AuthPage';
import GuestPage from './components/guest/GuestPage';
import StudentRegistrationForm from './components/student/StudentRegistrationForm';
import StudentDashboard from './components/student/StudentDashboard';
import StaffRegistrationForm from './components/staff/StaffRegistrationForm';
import StaffDashboard from './components/staff/StaffDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ParentDashboard from './components/parent/ParentDashboard';
import AdmissionLetter from './components/shared/AdmissionLetter';

// Auth Context
const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('meritUser');
      const token = sessionStorage.getItem('meritToken');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from session:', error);
      sessionStorage.clear();
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    sessionStorage.setItem('meritUser', JSON.stringify(userData));
    sessionStorage.setItem('meritToken', token);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Router Component
const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // HOME / LANDING PAGE
  if (currentPath === '/' || currentPath === '') {
    return <LandingPage navigate={navigate} />;
  }

  // ADMIN ROUTE (MUST BE FIRST)
  if (currentPath === '/xaxaxaxadmin') {
    return <AdminDashboard navigate={navigate} />;
  }

  // AUTH
  if (currentPath === '/auth' || currentPath.startsWith('/auth?')) {
    return <AuthPage navigate={navigate} />;
  }

  // GUEST
  if (currentPath === '/guest') {
    return <GuestPage navigate={navigate} />;
  }

  // STUDENT ROUTES
  if (currentPath === '/student/register') {
    return <StudentRegistrationForm navigate={navigate} />;
  }

  if (currentPath === '/student/dashboard') {
    return <StudentDashboard navigate={navigate} />;
  }

  if (currentPath === '/student/admission-letter') {
    return <AdmissionLetter navigate={navigate} />;
  }

  // STAFF ROUTES
  if (currentPath === '/staff/register') {
    return <StaffRegistrationForm navigate={navigate} />;
  }

  if (currentPath === '/staff/dashboard') {
    return <StaffDashboard navigate={navigate} />;
  }

  // PARENT ROUTE
  if (currentPath === '/parent/dashboard') {
    return <ParentDashboard navigate={navigate} />;
  }

  // 404
  return <PageUnderConstruction navigate={navigate} />;
};

// Page Under Construction
const PageUnderConstruction = ({ navigate }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">🚧</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Under Construction</h2>
      <p className="text-gray-600 mb-6">This page is being built and will be available soon.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        Go to Homepage
      </button>
    </div>
  </div>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeAnimation onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
