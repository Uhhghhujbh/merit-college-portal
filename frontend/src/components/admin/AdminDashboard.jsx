// frontend/src/components/admin/AdminDashboard.jsx - FIXED VERSION (Part 1 - Core Structure)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Settings, LogOut, Check, X, 
  Download, Search, MapPin, Clock,
  AlertCircle, CheckCircle, Ban, Trash2,
  BarChart3, TrendingUp, Activity, Shield, Menu
} from 'lucide-react';
import { useAuth } from '../../App';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout: contextLogout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0, pendingStudents: 0, activeStudents: 0, suspendedStudents: 0,
    totalStaff: 0, activeStaff: 0, pendingPayments: 0, totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      setClockedIn(true);
      fetchDashboardData();
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');

      const [studentsRes, staffRes, statsRes] = await Promise.all([
        fetch('/api/admin/students', { headers: { Authorization: `Bearer ${token}` }}),
        fetch('/api/admin/staff', { headers: { Authorization: `Bearer ${token}` }}),
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` }})
      ]);

      if (!studentsRes.ok || !staffRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const studentsData = await studentsRes.json();
      const staffData = await staffRes.json();
      const statsData = await statsRes.json();

      setStudents(studentsData || []);
      setStaff(staffData || []);
      setStats(statsData || stats);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };

          const res = await fetch('/api/admin/clock-in', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              reason: 'Daily admin access',
              location: JSON.stringify(location)
            })
          });

          if (res.ok) {
            setClockedIn(true);
            setClockInTime(new Date().toLocaleString());
            fetchDashboardData();
          }
        } catch (err) {
          console.error('Clock-in error:', err);
          alert('Clock-in failed');
        }
      });
    }
  };

  const handleValidateStudent = async (studentId, status) => {
    try {
      const res = await fetch('/api/admin/students/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ studentId, status })
      });

      if (!res.ok) throw new Error('Validation failed');

      alert(`Student ${status === 'active' ? 'validated' : 'rejected'} successfully`);
      fetchDashboardData();
    } catch (err) {
      console.error('Validation error:', err);
      alert('Failed to validate student');
    }
  };

  const handleSuspendAccount = async (accountId, accountType) => {
    if (!window.confirm(`Are you sure you want to suspend this ${accountType}?`)) return;

    try {
      const res = await fetch('/api/admin/suspend-account', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ accountId, accountType })
      });

      if (!res.ok) throw new Error('Suspension failed');

      alert('Account suspended successfully');
      fetchDashboardData();
    } catch (err) {
      console.error('Suspend error:', err);
      alert('Failed to suspend account');
    }
  };

  const handleDeleteAccount = async (accountId, accountType) => {
    if (!window.confirm(`⚠️ This will permanently delete this ${accountType}. Are you sure?`)) return;

    try {
      const res = await fetch('/api/admin/delete-account', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ accountId, accountType })
      });

      if (!res.ok) throw new Error('Deletion failed');

      alert('Account deleted successfully');
      fetchDashboardData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete account');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.clear();
      contextLogout();
      navigate('/', { replace: true });
    }
  };

  if (!clockedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <Shield className="w-20 h-20 text-gray-900 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Clock-In Required</h1>
          <p className="text-gray-600 mb-8">For security, admins must clock in with location</p>
          <button onClick={handleClockIn} className="px-8 py-4 bg-gray-900 text-white rounded-xl text-lg font-bold hover:bg-gray-800 transition flex items-center gap-3 mx-auto">
            <Clock className="w-6 h-6" />
            Clock In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-2xl ${sidebarOpen ? 'block' : 'hidden'}`}>Merit Admin</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          {clockInTime && sidebarOpen && <p className="text-sm text-gray-400 mt-2">Clocked in: {clockInTime}</p>}
        </div>
        
        <nav className="mt-8 flex-1">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'students', icon: Users, label: 'Students' },
            { id: 'staff', icon: UserCheck, label: 'Staff' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-800 transition ${currentView === item.id ? 'bg-gray-800 border-l-4 border-white' : ''}`}
            >
              <item.icon className="w-6 h-6" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-900 transition mt-auto"
        >
          <LogOut className="w-6 h-6" />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {currentView === 'overview' && (
              <OverviewView stats={stats} />
            )}
            {currentView === 'students' && (
              <StudentsView 
                students={students}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onValidate={handleValidateStudent}
                onSuspend={handleSuspendAccount}
                onDelete={handleDeleteAccount}
              />
            )}
            {currentView === 'staff' && (
              <StaffView 
                staff={staff}
                onSuspend={handleSuspendAccount}
                onDelete={handleDeleteAccount}
              />
            )}
            {currentView === 'settings' && (
              <SettingsView />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView = ({ stats }) => {
  const safeStats = {
    totalStudents: stats?.totalStudents || 0,
    pendingStudents: stats?.pendingStudents || 0,
    activeStudents: stats?.activeStudents || 0,
    suspendedStudents: stats?.suspendedStudents || 0,
    totalStaff: stats?.totalStaff || 0,
    activeStaff: stats?.activeStaff || 0,
    pendingPayments: stats?.pendingPayments || 0,
    totalRevenue: stats?.totalRevenue || 0
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: safeStats.totalStudents, icon: Users, color: 'blue', subtitle: `${safeStats.pendingStudents} pending` },
          { label: 'Active Students', value: safeStats.activeStudents, icon: CheckCircle, color: 'green', subtitle: `${safeStats.suspendedStudents} suspended` },
          { label: 'Total Staff', value: safeStats.totalStaff, icon: UserCheck, color: 'purple', subtitle: `${safeStats.activeStaff} active` },
          { label: 'Pending Payments', value: safeStats.pendingPayments, icon: AlertCircle, color: 'orange', subtitle: 'Requires attention' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <stat.icon className={`w-12 h-12 text-${stat.color}-600 opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 mb-2">Total Revenue</p>
            <h3 className="text-4xl font-bold">₦{safeStats.totalRevenue.toLocaleString()}</h3>
          </div>
          <TrendingUp className="w-12 h-12 text-green-400" />
        </div>
      </div>
    </div>
  );
};

// Students View Component  
const StudentsView = ({ students, searchTerm, setSearchTerm, onValidate, onSuspend, onDelete }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Student Management</h2>

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
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Programme</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.student_id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{student.programme}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {student.status === 'pending' && (
                          <>
                            <button onClick={() => onValidate(student.student_id, 'active')} className="text-green-600 hover:text-green-800" title="Validate">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => onValidate(student.student_id, 'rejected')} className="text-red-600 hover:text-red-800" title="Reject">
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => onSuspend(student.student_id, 'student')} className="text-orange-600 hover:text-orange-800" title="Suspend">
                          <Ban className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(student.student_id, 'student')} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 className="w-5 h-5" />
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

// Staff View Component
const StaffView = ({ staff, onSuspend, onDelete }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Position</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.staff_id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{member.staff_id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{member.full_name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{member.department}</td>
                    <td className="px-6 py-4">{member.position}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => onSuspend(member.staff_id, 'staff')} className="text-orange-600 hover:text-orange-800" title="Suspend">
                          <Ban className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(member.staff_id, 'staff')} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 className="w-5 h-5" />
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

// Settings View Component
const SettingsView = () => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleGenerateCode = async () => {
    try {
      const res = await fetch('/api/admin/staff/generate-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`
        }
      });

      if (!res.ok) throw new Error('Failed to generate code');

      const data = await res.json();
      setVerificationCode(data.code);
      alert(`Staff code generated!\n\nCode: ${data.code}\nExpires: ${new Date(data.expiresAt).toLocaleString()}`);
    } catch (err) {
      console.error('Generate code error:', err);
      alert('Failed to generate verification code');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900">Admin Settings</h2>

      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Generate Staff Code</h3>
          <button
            onClick={handleGenerateCode}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Generate New Code
          </button>
          {verificationCode && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-bold text-green-900 mb-2">Latest Code:</p>
              <code className="text-2xl font-bold text-green-700">{verificationCode}</code>
            </div>
          )}
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-xl font-bold mb-4">Security</h3>
          <p className="text-gray-600">Your session is protected. Clock-out when done.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
