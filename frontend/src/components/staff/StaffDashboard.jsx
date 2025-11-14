import React, { useState, useEffect } from 'react';
import { LogOut, Home, AlertCircle } from 'lucide-react';

const StaffDashboard = ({ navigate }) => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const token = sessionStorage.getItem('meritToken');
      const user = JSON.parse(sessionStorage.getItem('meritUser') || '{}');
      
      if (!token || !user.id) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`/api/staff/profile/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load staff data');
    } finally {
      setLoading(false);
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/meritlogo.jpg" 
              alt="Merit College" 
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Staff Portal</h1>
              <p className="text-sm text-gray-600">{staff?.full_name}</p>
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
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Dashboard Under Construction</h2>
          <p className="text-gray-600 mb-6">
            The full staff management system is being built and will be available soon.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </button>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;