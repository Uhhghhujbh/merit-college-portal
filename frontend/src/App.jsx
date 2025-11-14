// import React, { useState, useEffect } from 'react';

// // Components
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

// // Auth Context
// const AuthContext = React.createContext(null);

// export const useAuth = () => {
//   const context = React.useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = sessionStorage.getItem('meritUser');
//     const token = sessionStorage.getItem('meritToken');
//     if (storedUser && token) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData, token) => {
//     setUser(userData);
//     sessionStorage.setItem('meritUser', JSON.stringify(userData));
//     sessionStorage.setItem('meritToken', token);
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

// // Router Component
// const Router = () => {
//   const [currentPath, setCurrentPath] = useState(window.location.pathname);

//   useEffect(() => {
//     const handleNavigation = () => {
//       setCurrentPath(window.location.pathname);
//     };

//     window.addEventListener('popstate', handleNavigation);
//     return () => window.removeEventListener('popstate', handleNavigation);
//   }, []);

//   const navigate = (path) => {
//     window.history.pushState({}, '', path);
//     setCurrentPath(path);
//   };

//   // Route matching
//   if (currentPath === '/' || currentPath === '') {
//     return <LandingPage navigate={navigate} />;
//   }

//   if (currentPath === '/auth' || currentPath.startsWith('/auth?')) {
//     return <AuthPage navigate={navigate} />;
//   }

//   if (currentPath === '/guest') {
//     return <GuestPage navigate={navigate} />;
//   }

//   if (currentPath === '/student/register') {
//     return <StudentRegistrationForm navigate={navigate} />;
//   }

//   if (currentPath === '/student/dashboard') {
//     return <StudentDashboard navigate={navigate} />;
//   }

//   if (currentPath === '/student/admission-letter') {
//     return <AdmissionLetter navigate={navigate} />;
//   }

//   if (currentPath === '/staff/register') {
//     return <StaffRegistrationForm navigate={navigate} />;
//   }

//   if (currentPath === '/staff/dashboard') {
//     return <StaffDashboard navigate={navigate} />;
//   }

//   if (currentPath === '/parent/dashboard') {
//     return <ParentDashboard navigate={navigate} />;
//   }

//   if (currentPath === '/xaxaxaxadmin') {
//     return <AdminDashboard navigate={navigate} />;
//   }

//   // 404 - Page under construction
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="text-center">
//         <h1 className="text-6xl font-bold text-gray-900 mb-4">🚧</h1>
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Under Construction</h2>
//         <p className="text-gray-600 mb-6">This page is being built and will be available soon.</p>
//         <button
//           onClick={() => navigate('/')}
//           className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
//         >
//           Go to Homepage
//         </button>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router />
//     </AuthProvider>
//   );
// }

// export default App;









import React, { useState, useEffect } from 'react';

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

// Lazy load components with error boundaries
const ComponentLoader = ({ component: Component, navigate, ...props }) => {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl mb-4">⚠️</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Component Error</h2>
          <p className="text-gray-600 mb-2">Failed to load component</p>
          <p className="text-sm text-red-600 mb-6">{error.message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  try {
    return <Component navigate={navigate} {...props} />;
  } catch (err) {
    setError(err);
    return null;
  }
};

// Router Component
const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [components, setComponents] = useState({});
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Load components dynamically
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const [
          LandingPage,
          AuthPage,
          GuestPage,
          StudentRegistrationForm,
          StudentDashboard,
          StaffRegistrationForm,
          StaffDashboard,
          AdminDashboard,
          ParentDashboard,
          AdmissionLetter
        ] = await Promise.all([
          import('./components/shared/LandingPage').catch(e => ({ default: null, error: e })),
          import('./components/auth/AuthPage').catch(e => ({ default: null, error: e })),
          import('./components/guest/GuestPage').catch(e => ({ default: null, error: e })),
          import('./components/student/StudentRegistrationForm').catch(e => ({ default: null, error: e })),
          import('./components/student/StudentDashboard').catch(e => ({ default: null, error: e })),
          import('./components/staff/StaffRegistrationForm').catch(e => ({ default: null, error: e })),
          import('./components/staff/StaffDashboard').catch(e => ({ default: null, error: e })),
          import('./components/admin/AdminDashboard').catch(e => ({ default: null, error: e })),
          import('./components/parent/ParentDashboard').catch(e => ({ default: null, error: e })),
          import('./components/shared/AdmissionLetter').catch(e => ({ default: null, error: e }))
        ]);

        setComponents({
          LandingPage: LandingPage.default,
          AuthPage: AuthPage.default,
          GuestPage: GuestPage.default,
          StudentRegistrationForm: StudentRegistrationForm.default,
          StudentDashboard: StudentDashboard.default,
          StaffRegistrationForm: StaffRegistrationForm.default,
          StaffDashboard: StaffDashboard.default,
          AdminDashboard: AdminDashboard.default,
          ParentDashboard: ParentDashboard.default,
          AdmissionLetter: AdmissionLetter.default
        });
      } catch (error) {
        console.error('Failed to load components:', error);
        setLoadError(error);
      }
    };

    loadComponents();
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Show loading while components are being loaded
  if (Object.keys(components).length === 0 && !loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show error if components failed to load
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl mb-4">❌</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
          <p className="text-gray-600 mb-2">Failed to load application components</p>
          <p className="text-sm text-red-600 mb-6">{loadError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const {
    LandingPage,
    AuthPage,
    GuestPage,
    StudentRegistrationForm,
    StudentDashboard,
    StaffRegistrationForm,
    StaffDashboard,
    AdminDashboard,
    ParentDashboard,
    AdmissionLetter
  } = components;

  // Route matching with component existence check
  // if (currentPath === '/' || currentPath === '') {
  //   if (!LandingPage) {
  //     console.error('LandingPage component not found');
  //     return <PageUnderConstruction navigate={navigate} componentName="Landing Page" />;
  //   }
  //   return <ComponentLoader component={LandingPage} navigate={navigate} />;
  // }

  if (currentPath === '/auth' || currentPath.startsWith('/auth?')) {
    if (!AuthPage) {
      console.error('AuthPage component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Auth Page" />;
    }
    return <ComponentLoader component={AuthPage} navigate={navigate} />;
  }

  if (currentPath === '/guest') {
    if (!GuestPage) {
      console.error('GuestPage component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Guest Page" />;
    }
    return <ComponentLoader component={GuestPage} navigate={navigate} />;
  }

  if (currentPath === '/student/register') {
    if (!StudentRegistrationForm) {
      console.error('StudentRegistrationForm component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Student Registration" />;
    }
    return <ComponentLoader component={StudentRegistrationForm} navigate={navigate} />;
  }

  if (currentPath === '/student/dashboard') {
    if (!StudentDashboard) {
      console.error('StudentDashboard component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Student Dashboard" />;
    }
    return <ComponentLoader component={StudentDashboard} navigate={navigate} />;
  }

  if (currentPath === '/student/admission-letter') {
    if (!AdmissionLetter) {
      console.error('AdmissionLetter component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Admission Letter" />;
    }
    return <ComponentLoader component={AdmissionLetter} navigate={navigate} />;
  }

  if (currentPath === '/staff/register') {
    if (!StaffRegistrationForm) {
      console.error('StaffRegistrationForm component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Staff Registration" />;
    }
    return <ComponentLoader component={StaffRegistrationForm} navigate={navigate} />;
  }

  if (currentPath === '/staff/dashboard') {
    if (!StaffDashboard) {
      console.error('StaffDashboard component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Staff Dashboard" />;
    }
    return <ComponentLoader component={StaffDashboard} navigate={navigate} />;
  }

  if (currentPath === '/parent/dashboard') {
    if (!ParentDashboard) {
      console.error('ParentDashboard component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Parent Dashboard" />;
    }
    return <ComponentLoader component={ParentDashboard} navigate={navigate} />;
  }

  if (currentPath === '/xaxaxaxadmin') {
    if (!AdminDashboard) {
      console.error('AdminDashboard component not found');
      return <PageUnderConstruction navigate={navigate} componentName="Admin Dashboard" />;
    }
    return <ComponentLoader component={AdminDashboard} navigate={navigate} />;
  }

  // 404 - Page not found
  return <PageUnderConstruction navigate={navigate} />;
};

// Page Under Construction Component
const PageUnderConstruction = ({ navigate, componentName }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">🚧</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {componentName ? `${componentName} Under Construction` : 'Page Under Construction'}
      </h2>
      <p className="text-gray-600 mb-6">
        {componentName 
          ? `The ${componentName} component is being built and will be available soon.`
          : 'This page is being built and will be available soon.'}
      </p>
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
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;