// frontend/src/App.jsx
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
export const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = sessionStorage.getItem('meritUser');
        const token = sessionStorage.getItem('meritToken');
        
        console.log('Auth initialization:', { storedUser, tokenExists: !!token });
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from session:', error);
        sessionStorage.removeItem('meritUser');
        sessionStorage.removeItem('meritToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    console.log('Login called:', { userData, token });
    setUser(userData);
    sessionStorage.setItem('meritUser', JSON.stringify(userData));
    sessionStorage.setItem('meritToken', token);
  };

  const logout = () => {
    console.log('Logout called');
    setUser(null);
    sessionStorage.removeItem('meritUser');
    sessionStorage.removeItem('meritToken');
    sessionStorage.removeItem('pendingRegistration');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Router Component
const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);
  const { user } = useAuth();

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('pushstate', handleNavigation);
    };
  }, []);

  const navigate = (path) => {
    console.log('Navigating to:', path);
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new Event('pushstate'));
  };

  // Check authentication for protected routes
  const requireAuth = (requiredRole = null) => {
    if (!user) {
      navigate('/auth');
      return false;
    }
    if (requiredRole && user.role !== requiredRole) {
      navigate('/');
      return false;
    }
    return true;
  };

  console.log('Current path:', currentPath, 'User:', user);

  // Route definitions
  if (currentPath === '/' || currentPath === '') {
    return <LandingPage navigate={navigate} />;
  }

  // ADMIN ROUTE
  if (currentPath === '/xaxaxaxadmin') {
    return <AdminDashboard navigate={navigate} />;
  }

  // AUTH ROUTES
  if (currentPath === '/auth' || currentPath.startsWith('/auth?')) {
    return <AuthPage navigate={navigate} />;
  }

  // GUEST ROUTE
  if (currentPath === '/guest') {
    return <GuestPage navigate={navigate} />;
  }

  // STUDENT ROUTES
  if (currentPath === '/student/register') {
    return <StudentRegistrationForm navigate={navigate} />;
  }

  if (currentPath === '/student/dashboard') {
    if (!requireAuth('student')) return null;
    return <StudentDashboard navigate={navigate} />;
  }

  if (currentPath === '/student/admission-letter') {
    if (!requireAuth('student')) return null;
    return <AdmissionLetter navigate={navigate} />;
  }

  // STAFF ROUTES
  if (currentPath === '/staff/register') {
    return <StaffRegistrationForm navigate={navigate} />;
  }

  if (currentPath === '/staff/dashboard') {
    if (!requireAuth('staff')) return null;
    return <StaffDashboard navigate={navigate} />;
  }

  // PARENT ROUTE
  if (currentPath === '/parent/dashboard') {
    if (!requireAuth('parent')) return null;
    return <ParentDashboard navigate={navigate} />;
  }

  // 404 - Page Under Construction
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">🚧</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

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
