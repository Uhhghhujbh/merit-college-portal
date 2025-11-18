// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

const AuthContext = React.createContext(null);

export const useAuth = () => React.useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = sessionStorage.getItem('meritUser');
        const token = sessionStorage.getItem('meritToken');
        if (stored && token) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    sessionStorage.setItem('meritUser', JSON.stringify(userData));
    sessionStorage.setItem('meritToken', token);
    if (userData.role === 'admin') {
      sessionStorage.setItem('adminToken', token);
    }
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/');
    }
  }, [user, navigate, allowedRoles]);

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return children;
};

function MainApp() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeAnimation onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/guest" element={<GuestPage />} />
        <Route path="/student/register" element={<StudentRegistrationForm />} />
        <Route path="/staff/register" element={<StaffRegistrationForm />} />
        <Route path="/student/admission-letter" element={<AdmissionLetter />} />

        {/* Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/xaxaxaxadmin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
