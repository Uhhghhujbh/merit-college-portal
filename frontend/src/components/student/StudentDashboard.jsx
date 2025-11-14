import React, { useState, useEffect } from 'react';
import { 
  User, Book, Calendar, Home, LogOut, Mail, Phone,
  FileText, Download, Clock, CheckCircle, XCircle,
  AlertCircle, Save, X, ExternalLink
} from 'lucide-react';

// Place in: frontend/src/components/student/StudentDashboard.jsx

const StudentDashboard = ({ navigate }) => {
  const [currentView, setCurrentView] = useState('overview');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = sessionStorage.getItem('studentToken');
      const user = JSON.parse(sessionStorage.getItem('meritUser') || '{}');
      
      if (!token || !user.id) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`/api/students/profile/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.clear();
          navigate('/auth');
          return;
        }
        throw new Error('Failed to fetch student data');
      }
      
      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student data:', error);
      alert('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill all password fields');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const token = sessionStorage.getItem('studentToken');
      const response = await fetch('/api/students/update-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.student_id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password update failed');
      }

      alert('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.clear();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-4">Failed to load student data</p>
          <button 
            onClick={() => navigate('/auth')} 
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
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
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">{student.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{student.student_id}</p>
                <p className="text-xs text-gray-600">{student.programme} - {student.department}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 flex gap-2 border-t border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'courses', label: 'Courses', icon: Book },
            { id: 'timetable', label: 'Timetable', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`px-4 py-3 font-semibold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
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

      <main className="p-6 max-w-7xl mx-auto">
        {currentView === 'overview' && <OverviewView student={student} />}
        {currentView === 'profile' && (
          <ProfileView 
            student={student} 
            showPasswordChange={showPasswordChange}
            setShowPasswordChange={setShowPasswordChange}
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            handlePasswordChange={handlePasswordChange}
          />
        )}
        {currentView === 'courses' && <CoursesView student={student} />}
        {currentView === 'timetable' && <TimetableView />}
      </main>
    </div>
  );
};

const OverviewView = ({ student }) => {
  const getStatusColor = (status) => {
    if (status === 'active') return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
    if (status === 'pending') return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
    return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
  };

  const statusColors = getStatusColor(student.status);
  const resumptionDate = student.registration_date 
    ? new Date(new Date(student.registration_date).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {student.full_name.split(' ')[0]}!
        </h2>
        <p className="text-gray-600">Here's your academic overview</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className={`border-2 rounded-xl p-6 ${statusColors.bg} ${statusColors.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center ${statusColors.text}`}>
              {student.status === 'active' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
          </div>
          <h3 className="text-sm font-semibold mb-1 text-gray-700">Account Status</h3>
          <p className="text-xl font-bold capitalize">{student.status}</p>
        </div>

        <div className="border-2 rounded-xl p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600">
              <Book className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-semibold mb-1 text-gray-700">Programme</h3>
          <p className="text-xl font-bold">{student.programme}</p>
        </div>

        <div className="border-2 rounded-xl p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-semibold mb-1 text-gray-700">Department</h3>
          <p className="text-xl font-bold">{student.department}</p>
        </div>
      </div>

      {student.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-2">Account Validated</h3>
              <p className="text-sm text-green-800">
                Your account has been validated by the administration. You can now access all portal features.
              </p>
              {resumptionDate && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm font-semibold text-green-900">
                    Resumption Date: {resumptionDate.toLocaleDateString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {student.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-2">Pending Validation</h3>
              <p className="text-sm text-yellow-800">
                Your registration is being reviewed by the administration. This typically takes 1-3 business days. 
                You will receive an email once your account is validated.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Student ID</p>
            <p className="font-semibold text-gray-900">{student.student_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Programme</p>
            <p className="font-semibold text-gray-900">{student.programme}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Department</p>
            <p className="font-semibold text-gray-900">{student.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Registration Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(student.registration_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {student.subjects && Array.isArray(student.subjects) && student.subjects.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Enrolled Subjects ({student.subjects.length})
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            {student.subjects.map((subject, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-900">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Additional Features Coming Soon</h3>
            <p className="text-sm text-blue-800 mb-2">
              The following features are currently being set up:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>Chat Support (24/7 student assistance)</li>
              <li>Hostel Management</li>
              <li>Digital Library</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ student, showPasswordChange, setShowPasswordChange, passwordData, setPasswordData, handlePasswordChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0">
            {student.photo_url ? (
              <img src={student.photo_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{student.full_name}</h3>
            <p className="text-gray-600 mb-2">{student.student_id}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                {student.programme}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                {student.department}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={student.email}
              disabled
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={student.phone}
              disabled
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-600"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          To update your contact information, please contact the administration office.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Password & Security</h3>
            <p className="text-sm text-gray-600">Update your password</p>
          </div>
          {!showPasswordChange && (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordChange && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Current password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="New password (min. 8 characters)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CoursesView = ({ student }) => {
  if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No subjects enrolled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Subjects</h2>
        <p className="text-gray-600">View your enrolled subjects</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Enrolled Subjects ({student.subjects.length})
        </h3>
        <div className="space-y-3">
          {student.subjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{subject}</p>
                  <p className="text-sm text-gray-600">{student.programme}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">Course Features (Coming Soon)</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Online Tests and Assessments
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Staff Messages and Announcements
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Performance Reports
          </li>
        </ul>
      </div>
    </div>
  );
};

const TimetableView = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Timetable</h2>
      <p className="text-gray-600">View your weekly schedule</p>
    </div>

    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">External Timetable System</h3>
        <a
          href="https://meritstudenttimetable.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Timetable
        </a>
      </div>

      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          Your class timetable is hosted on our dedicated system.
        </p>
        <a
          href="https://meritstudenttimetable.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:underline"
        >
          Click here to view your timetable
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

export default StudentDashboard;