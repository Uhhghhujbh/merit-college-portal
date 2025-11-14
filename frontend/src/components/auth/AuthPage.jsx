import React, { useState, useEffect } from 'react';
import { User, Users, UserCheck, Home, Mail, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../App';

const AuthPage = ({ navigate }) => {
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    surname: ''
  });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  useEffect(() => {
    // Check URL params for register mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === 'true') {
      setIsRegister(true);
    }
  }, []);

  const roles = [
    { 
      id: 'student', 
      icon: <User className="w-8 h-8" />, 
      title: 'Student', 
      desc: 'Access learning materials and exams' 
    },
    { 
      id: 'staff', 
      icon: <UserCheck className="w-8 h-8" />, 
      title: 'Staff', 
      desc: 'Manage classes and student progress' 
    },
    { 
      id: 'parent', 
      icon: <Users className="w-8 h-8" />, 
      title: 'Parent', 
      desc: "Monitor your child's performance" 
    },
    { 
      id: 'guest', 
      icon: <Home className="w-8 h-8" />, 
      title: 'Guest', 
      desc: 'Explore our services' 
    }
  ];

  const handleRoleSelect = (roleId) => {
    if (roleId === 'guest') {
      navigate('/guest');
      return;
    }
    setSelectedRole(roleId);
    setStep('auth');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedRole === 'parent') {
      if (!formData.studentId) newErrors.studentId = 'Student ID is required';
      if (!formData.surname) newErrors.surname = 'Surname is required';
    } else {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (isRegister && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isRegister) {
        // Navigate to registration form
        if (selectedRole === 'student') navigate('/student/register');
        if (selectedRole === 'staff') navigate('/staff/register');
        return;
      }

      // Login
      let endpoint = '';
      let body = {};

      if (selectedRole === 'parent') {
        endpoint = '/api/auth/parent/login';
        body = {
          studentId: formData.studentId,
          surname: formData.surname
        };
      } else {
        endpoint = `/api/auth/${selectedRole}/login`;
        body = {
          email: formData.email,
          password: formData.password
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      login(data.user || data.student, data.token);
      sessionStorage.setItem('meritToken', data.token);

      // Navigate to appropriate dashboard
      if (selectedRole === 'student') navigate('/student/dashboard');
      if (selectedRole === 'staff') navigate('/staff/dashboard');
      if (selectedRole === 'parent') navigate('/parent/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="bg-gray-900 text-white p-8 text-center">
            <img 
              src="/meritlogo.jpg" 
              alt="Merit College" 
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ display: 'none' }}>
              <span className="text-2xl font-bold">MC</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Merit College</h1>
            <p className="text-gray-300">Access your educational portal</p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Choose Your Role</h2>
            <p className="text-gray-600 text-center mb-8">Select how you want to access the portal</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-900 hover:bg-gray-50 transition-all text-center group transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {role.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.desc}</p>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 font-semibold hover:text-gray-900 hover:underline"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gray-900 text-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">
            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal
          </h1>
          <p className="text-gray-300">Welcome back!</p>
        </div>

        <div className="p-8">
          {selectedRole !== 'parent' && (
            <div className="flex gap-2 mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => { setIsRegister(false); setErrors({}); }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  !isRegister ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsRegister(true); setErrors({}); }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  isRegister ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600'
                }`}
              >
                Register
              </button>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {selectedRole === 'parent' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    placeholder="e.g., MCAS/SCI/25/001/A"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
                      errors.studentId ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.studentId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Surname
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    placeholder="Enter student's surname"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
                      errors.surname ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.surname && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.surname}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {!isRegister && selectedRole === 'student' ? 'Student ID or Email' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
                {isRegister && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              isRegister ? 'Continue to Registration' : 'Login'
            )}
          </button>

          <div className="text-center mt-6 space-y-2">
            {!isRegister && selectedRole !== 'parent' && (
              <button className="text-gray-600 text-sm hover:text-gray-900 hover:underline block w-full">
                Forgot Password?
              </button>
            )}
            <button
              onClick={() => { setStep('role'); setErrors({}); }}
              className="text-gray-700 font-semibold hover:text-gray-900 hover:underline block w-full"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;