import React, { useState, useEffect } from 'react';
import { 
  User, LogOut, Book, FileText, TrendingUp, Calendar,
  Mail, Phone, AlertCircle, CheckCircle, BarChart3, Download
} from 'lucide-react';

// Place in: frontend/src/components/parent/ParentDashboard.jsx

const ParentDashboard = ({ navigate }) => {
  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchStudentData = async () => {
    try {
      // Get studentId from session/auth
      const parentAuth = JSON.parse(sessionStorage.getItem('meritUser'));
      
      const response = await fetch(`/api/students/profile/${parentAuth.studentId}`, {
        headers: {
          'Authorization': `Bearer ${parentAuth.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setStudent(data);
      
      // Fetch reports
      const reportsResponse = await fetch(`/api/students/${parentAuth.studentId}/reports`, {
        headers: {
          'Authorization': `Bearer ${parentAuth.token}`
        }
      });
      
      const reportsData = await reportsResponse.json();
      setReports(reportsData);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  fetchStudentData();
}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-xl font-bold text-gray-900">Parent Portal</h1>
                <p className="text-sm text-gray-600">Viewing: {student.name}</p>
              </div>
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
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-gray-600">{student.id}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                    {student.programme}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
                    {student.department}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {student.status}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{student.overallPercentage}%</h3>
            <p className="text-gray-600 font-medium">Overall Average</p>
            <p className="text-sm text-green-600 mt-1">Grade: {student.overallGrade}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{student.attendance}%</h3>
            <p className="text-gray-600 font-medium">Attendance Rate</p>
            <p className="text-sm text-blue-600 mt-1">Excellent attendance</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{student.subjects.length}</h3>
            <p className="text-gray-600 font-medium">Enrolled Subjects</p>
            <p className="text-sm text-purple-600 mt-1">{student.programme}</p>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
          <div className="space-y-4">
            {student.subjects.map((subject, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{subject.name}</h4>
                    <p className="text-sm text-gray-600">Teacher: {subject.teacher}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{subject.grade}</div>
                    <p className="text-sm text-gray-600">{subject.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      subject.percentage >= 85 ? 'bg-green-500' :
                      subject.percentage >= 70 ? 'bg-blue-500' :
                      subject.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Available Reports</h3>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Student Contact Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {student.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {student.phone}
            </p>
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Parent Access - Read Only</h3>
              <p className="text-sm text-yellow-800">
                As a parent, you can view your child's academic performance and reports. 
                For any concerns or inquiries, please contact the administration or your child's teachers directly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;