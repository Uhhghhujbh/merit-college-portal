// // frontend/src/App.jsx - FIXED VERSION
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import WelcomeAnimation from './components/shared/WelcomeAnimation';
// import LandingPage from './components/shared/LandingPage';
// import AuthPage from './components/auth/AuthPage';
// import GuestPage from './components/guest/GuestPage';
// import StudentRegistrationForm from './components/student/StudentRegistrationForm';
// import StudentDashboard from './components/student/StudentDashboard';
// import StaffRegistrationForm from './components/staff/StaffRegistrationForm';
// import StaffDashboard from './components/staff/StaffDashboard';
// import AdminDashboard from './components/admin/AdminDashboard';
// import ParentDashboard from './components/parent/ParentDashboard';
// import AdmissionLetter from './components/shared/AdmissionLetter';

// const AuthContext = React.createContext(null);

// export const useAuth = () => React.useContext(AuthContext);

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadUser = () => {
//       try {
//         const stored = sessionStorage.getItem('meritUser');
//         const token = sessionStorage.getItem('meritToken');
//         if (stored && token) {
//           setUser(JSON.parse(stored));
//         }
//       } catch (e) {
//         sessionStorage.clear();
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadUser();
//   }, []);

//   const login = (userData, token) => {
//     setUser(userData);
//     sessionStorage.setItem('meritUser', JSON.stringify(userData));
//     sessionStorage.setItem('meritToken', token);
//     if (userData.role === 'admin') {
//       sessionStorage.setItem('adminToken', token);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     sessionStorage.clear();
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate('/auth', { replace: true });
//     } else if (allowedRoles && !allowedRoles.includes(user.role)) {
//       navigate('/', { replace: true });
//     }
//   }, [user, navigate, allowedRoles]);

//   if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
//     return null;
//   }

//   return children;
// };

// function MainApp() {
//   const [showWelcome, setShowWelcome] = useState(true);

//   if (showWelcome) {
//     return <WelcomeAnimation onComplete={() => setShowWelcome(false)} />;
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/auth" element={<AuthPage />} />
//         <Route path="/guest" element={<GuestPage />} />
//         <Route path="/student/register" element={<StudentRegistrationForm />} />
//         <Route path="/staff/register" element={<StaffRegistrationForm />} />
//         <Route path="/student/admission-letter" element={<AdmissionLetter />} />

//         {/* Protected Routes */}
//         <Route
//           path="/student/dashboard"
//           element={
//             <ProtectedRoute allowedRoles={['student']}>
//               <StudentDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/staff/dashboard"
//           element={
//             <ProtectedRoute allowedRoles={['staff']}>
//               <StaffDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/parent/dashboard"
//           element={
//             <ProtectedRoute allowedRoles={['parent']}>
//               <ParentDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/xaxaxaxadmin"
//           element={
//             <ProtectedRoute allowedRoles={['admin']}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <MainApp />
//     </AuthProvider>
//   );
// }





import React, { useState, useEffect } from 'react';

// Components
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
    const storedUser = sessionStorage.getItem('meritUser');
    const token = sessionStorage.getItem('meritToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
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

  // Route matching
  if (currentPath === '/' || currentPath === '') {
    return <LandingPage navigate={navigate} />;
  }

  if (currentPath === '/auth' || currentPath.startsWith('/auth?')) {
    return <AuthPage navigate={navigate} />;
  }

  if (currentPath === '/guest') {
    return <GuestPage navigate={navigate} />;
  }

  if (currentPath === '/student/register') {
    return <StudentRegistrationForm navigate={navigate} />;
  }

  if (currentPath === '/student/dashboard') {
    return <StudentDashboard navigate={navigate} />;
  }

  if (currentPath === '/student/admission-letter') {
    return <AdmissionLetter navigate={navigate} />;
  }

  if (currentPath === '/staff/register') {
    return <StaffRegistrationForm navigate={navigate} />;
  }

  if (currentPath === '/staff/dashboard') {
    return <StaffDashboard navigate={navigate} />;
  }

  if (currentPath === '/parent/dashboard') {
    return <ParentDashboard navigate={navigate} />;
  }

  if (currentPath === '/xaxaxaxadmin') {
    return <AdminDashboard navigate={navigate} />;
  }

  // 404 - Page under construction
  return (
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
};

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
