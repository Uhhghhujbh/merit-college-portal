import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, FileText, Settings, LogOut, Eye, Check, X, 
  Download, Search, Filter, Calendar, MapPin, Clock, Mail, Phone,
  AlertCircle, CheckCircle, XCircle, Ban, Trash2, Edit, Send,
  BarChart3, TrendingUp, Activity, Shield, Lock, Unlock
} from 'lucide-react';

const AdminDashboard = ({ navigate }) => {
  const [currentView, setCurrentView] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInReason, setClockInReason] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Real data from API - WITH PROPER DEFAULT VALUES
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    activeStudents: 0,
    suspendedStudents: 0,
    totalStaff: 0,
    activeStaff: 0,
    pendingPayments: 0,
    totalRevenue: 0 // This ensures it's always a number
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (clockedIn && isAuthenticated) {
      fetchDashboardData();
    }
  }, [clockedIn, isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      
      const studentsRes = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();
      setStudents(studentsData || []);
      
      const staffRes = await fetch('/api/admin/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const staffData = await staffRes.json();
      setStaff(staffData || []);
      
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // CRITICAL FIX: Ensure all numeric values are valid numbers
      setStats({
        totalStudents: statsData.totalStudents || 0,
        pendingStudents: statsData.pendingStudents || 0,
        activeStudents: statsData.activeStudents || 0,
        suspendedStudents: statsData.suspendedStudents || 0,
        totalStaff: statsData.totalStaff || 0,
        activeStaff: statsData.activeStaff || 0,
        pendingPayments: statsData.pendingPayments || 0,
        totalRevenue: statsData.totalRevenue || 0
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          location: location
        })
      });

      if (!response.ok) {
        setLoginError('Invalid credentials. Access denied.');
        return;
      }

      const data = await response.json();
      
      setAdminUser({ email: data.admin.email });
      setIsAuthenticated(true);
      setLoginError('');
      
      sessionStorage.setItem('adminToken', data.token);
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleClockIn = async () => {
    if (!clockInReason.trim()) {
      alert('Please provide a reason for accessing the admin portal');
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken');
      await fetch('/api/admin/clock-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: clockInReason,
          location: location,
          timestamp: new Date().toISOString()
        })
      });

      setClockedIn(true);
      setClockInReason('');
    } catch (error) {
      console.error('Clock in error:', error);
      alert('Failed to clock in');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAdminUser(null);
      setClockedIn(false);
      navigate('/');
    }
  };

  const validateStudent = async (studentId, status) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/students/${studentId}/validate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Validation failed');

      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, status } : s
      ));
      
      alert(`Student ${studentId} has been ${status === 'active' ? 'validated' : 'rejected'}`);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate student');
    }
  };

  const suspendAccount = async (id, type) => {
    if (!window.confirm(`Are you sure you want to suspend this ${type}?`)) return;

    try {
      const token = sessionStorage.getItem('adminToken');
      const endpoint = type === 'student' ? 'students' : 'staff';
      
      const response = await fetch(`/api/admin/${endpoint}/${id}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Suspend failed');

      if (type === 'student') {
        setStudents(prev => prev.map(s => 
          s.id === id ? { ...s, status: 'suspended' } : s
        ));
      } else {
        setStaff(prev => prev.map(s => 
          s.id === id ? { ...s, status: 'suspended' } : s
        ));
      }
      
      alert(`${type} account suspended successfully`);
    } catch (error) {
      console.error('Suspend error:', error);
      alert('Failed to suspend account');
    }
  };

  const deleteAccount = async (id, type) => {
    if (!window.confirm(`⚠️ This will permanently delete this ${type}. Are you sure?`)) return;

    try {
      const token = sessionStorage.getItem('adminToken');
      const endpoint = type === 'student' ? 'students' : 'staff';
      
      const response = await fetch(`/api/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Delete failed');

      if (type === 'student') {
        setStudents(prev => prev.filter(s => s.id !== id));
      } else {
        setStaff(prev => prev.filter(s => s.id !== id));
      }
      
      alert(`${type} account deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete account');
    }
  };

  const downloadFormPDF = async (student) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/students/${student.id}/form-pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.id}_registration_form.pdf`;
      a.click();
      
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download form');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-600 mt-2">Authorized Personnel Only</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="admin@meritcollege.edu.ng"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            )}

            {location && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">Location Tracked</p>
                  <p className="text-xs text-green-700">Security monitoring active</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Access Admin Portal
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              All access attempts are logged and monitored for security purposes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Clock In Screen
  if (!clockedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Clock In Required</h1>
            <p className="text-gray-600 mt-2">Welcome, {adminUser.email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Access <span className="text-red-500">*</span>
              </label>
              <textarea
                value={clockInReason}
                onChange={(e) => setClockInReason(e.target.value)}
                placeholder="e.g., Validating student registrations, Managing staff accounts..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
              />
            </div>

            {location && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">Location</p>
                    <p className="text-xs text-blue-700">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleClockIn}
              disabled={!clockInReason.trim()}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clock In & Access Portal
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Cancel & Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Merit College Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{adminUser.email}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 flex gap-2 border-t border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'staff', label: 'Staff', icon: UserCheck },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`px-4 py-3 font-semibold transition flex items-center gap-2 border-b-2 ${
                currentView === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {currentView === 'overview' && <OverviewView stats={stats} />}
            {currentView === 'students' && (
              <StudentsView 
                students={students} 
                validateStudent={validateStudent}
                suspendAccount={suspendAccount}
                deleteAccount={deleteAccount}
                downloadFormPDF={downloadFormPDF}
              />
            )}
            {currentView === 'staff' && (
              <StaffView 
                staff={staff}
                suspendAccount={suspendAccount}
                deleteAccount={deleteAccount}
              />
            )}
            {currentView === 'settings' && <SettingsView />}
          </>
        )}
      </main>
    </div>
  );
};

// Overview View - FIXED
const OverviewView = ({ stats }) => {
  // CRITICAL FIX: Safely handle potentially undefined values
  const totalStudents = stats?.totalStudents || 0;
  const pendingStudents = stats?.pendingStudents || 0;
  const activeStudents = stats?.activeStudents || 0;
  const suspendedStudents = stats?.suspendedStudents || 0;
  const totalStaff = stats?.totalStaff || 0;
  const activeStaff = stats?.activeStaff || 0;
  const pendingPayments = stats?.pendingPayments || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          subtitle={`${pendingStudents} pending validation`}
        />
        <StatCard
          title="Active Students"
          value={activeStudents}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          subtitle={`${suspendedStudents} suspended`}
        />
        <StatCard
          title="Total Staff"
          value={totalStaff}
          icon={<UserCheck className="w-6 h-6" />}
          color="purple"
          subtitle={`${activeStaff} active`}
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments}
          icon={<AlertCircle className="w-6 h-6" />}
          color="orange"
          subtitle="Requires attention"
        />
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 mb-2">Total Revenue</p>
            <h3 className="text-4xl font-bold">₦{totalRevenue.toLocaleString()}</h3>
          </div>
          <TrendingUp className="w-12 h-12 text-green-400" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  // Safe value display
  const displayValue = value || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{displayValue}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// Students View
const StudentsView = ({ students, validateStudent, suspendAccount, deleteAccount, downloadFormPDF }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Programme</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.id}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                        {student.programme}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.status === 'active' ? 'bg-green-100 text-green-700' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {student.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(student.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {student.status === 'pending' && (
                          <>
                            <button
                              onClick={() => validateStudent(student.id, 'active')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Validate"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => validateStudent(student.id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => downloadFormPDF(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Download Form"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => suspendAccount(student.id, 'student')}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAccount(student.id, 'student')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Staff View
const StaffView = ({ staff, suspendAccount, deleteAccount }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Staff Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Login</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.id}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                        {member.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{member.position}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        member.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.lastLogin}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert(`Viewing clock-in logs for ${member.name}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Logs"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => suspendAccount(member.id, 'staff')}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAccount(member.id, 'staff')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {staff.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Staff Activity</h3>
          <div className="space-y-4">
            {staff.slice(0, 5).map(member => (
              <div key={member.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.position} - {member.department}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last login: {member.lastLogin}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location tracked
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Settings View
const SettingsView = () => {
  const [settings, setSettings] = useState({
    admissionOpen: true,
    autoValidation: false,
    emailNotifications: true,
    smsNotifications: false,
    requireEmailVerification: true,
    maxRegistrationDays: 7
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState([]);

  useEffect(() => {
    fetchVerificationCodes();
  }, []);

  const fetchVerificationCodes = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/admin/verification-codes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGeneratedCodes(data);
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    }
  };

  const generateStaffCode = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/admin/generate-staff-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setVerificationCode(data.code);
      setGeneratedCodes(prev => [data, ...prev]);
      
      alert(`Staff verification code generated!\n\nCode: ${data.code}\nExpires: ${new Date(data.expiresAt).toLocaleString()}\n\nThis code is valid for 6 hours.`);
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('Failed to generate verification code');
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Portal Settings</h2>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <SettingToggle
            label="Admission Registration Open"
            description="Allow new student registrations"
            checked={settings.admissionOpen}
            onChange={() => toggleSetting('admissionOpen')}
          />
          <SettingToggle
            label="Email Notifications"
            description="Send email notifications for important events"
            checked={settings.emailNotifications}
            onChange={() => toggleSetting('emailNotifications')}
          />
          <SettingToggle
            label="SMS Notifications"
            description="Send SMS notifications (additional charges apply)"
            checked={settings.smsNotifications}
            onChange={() => toggleSetting('smsNotifications')}
          />
          <SettingToggle
            label="Require Email Verification"
            description="Students must verify email before submission"
            checked={settings.requireEmailVerification}
            onChange={() => toggleSetting('requireEmailVerification')}
          />
          <SettingToggle
            label="Auto Validation"
            description="Automatically validate student accounts (not recommended)"
            checked={settings.autoValidation}
            onChange={() => toggleSetting('autoValidation')}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Registration Validation Period (Days)
          </label>
          <input
            type="number"
            value={settings.maxRegistrationDays}
            onChange={(e) => setSettings({ ...settings, maxRegistrationDays: parseInt(e.target.value) })}
            className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            min="1"
            max="30"
          />
          <p className="text-sm text-gray-600 mt-2">
            Accounts not validated within this period will be suspended
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Staff Verification Codes</h3>
            <p className="text-sm text-gray-600">Generate codes for new staff registration</p>
          </div>
          <button
            onClick={generateStaffCode}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Generate Code
          </button>
        </div>

        {verificationCode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-green-900 mb-2">Latest Generated Code:</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-bold text-green-700 bg-white px-4 py-2 rounded border-2 border-green-300">
                {verificationCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(verificationCode);
                  alert('Code copied to clipboard!');
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-green-700 mt-2">Valid for 6 hours from generation time</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Code History</h4>
          <div className="space-y-2">
            {generatedCodes.length === 0 ? (
              <p className="text-sm text-gray-500">No codes generated yet</p>
            ) : (
              generatedCodes.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <code className="font-bold text-gray-900">{item.code}</code>
                    <p className="text-xs text-gray-600 mt-1">
                      Created: {new Date(item.createdAt).toLocaleDateString()} • 
                      Expires: {new Date(item.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.used 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.used ? 'Used' : 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              O-Level Form Fee (₦)
            </label>
            <input
              type="number"
              defaultValue="10000"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              A-Level Acceptance Fee (₦)
            </label>
            <input
              type="number"
              defaultValue="25750"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bank Account Details
            </label>
            <textarea
              defaultValue="Account Name: Merit College of Advanced Studies&#10;Account Number: 8166985866&#10;Bank: MoniePoint MFB"
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Location Tracking Active</p>
                <p className="text-xs text-blue-700 mt-1">
                  All admin and staff logins are tracked with geolocation for security purposes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">Session Monitoring</p>
                <p className="text-xs text-green-700 mt-1">
                  All access attempts and activities are logged and monitored
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Change Admin Password
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="New password"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
              />
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
        <h3 className="text-lg font-bold text-red-700 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition text-left flex items-center justify-between">
            <span>Delete All Pending Registrations</span>
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition text-left flex items-center justify-between">
            <span>Reset All Student Passwords</span>
            <AlertCircle className="w-5 h-5" />
          </button>
          <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-left flex items-center justify-between">
            <span>Export All Data & Backup</span>
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Save All Settings
        </button>
      </div>
    </div>
  );
};

const SettingToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition ${
        checked ? 'bg-gray-900' : 'bg-gray-300'
      }`}
    >
      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
        checked ? 'transform translate-x-7' : ''
      }`} />
    </button>
  </div>
);

export default AdminDashboard;