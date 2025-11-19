// backend/src/controllers/admin.controller.js - COMPLETE FIXED VERSION
import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

// ✅ FIXED: Admin Login with proper validation
export const adminLogin = async (req, res) => {
  try {
    const { email, password, location } = req.body;

    console.log('🔐 Admin login attempt:', { email });

    // Valid admin credentials - PLAIN TEXT comparison
    const validAdmins = [
      { email: 'adewuyiayuba@gmail.com', password: 'Synthase1278' },
      { email: 'olayayemi@gmail.com', password: 'Synthase1278' }
    ];

    // Direct comparison (NO BCRYPT for admin)
    const admin = validAdmins.find(a => 
      a.email.toLowerCase() === email.toLowerCase() && 
      a.password === password
    );

    if (!admin) {
      console.log('❌ Invalid admin credentials');
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    console.log('✅ Admin credentials valid');

    // Log admin access with location if provided
    if (location) {
      try {
        await supabase.from('admin_logs').insert({
          admin_email: email,
          action: 'login',
          location: typeof location === 'string' ? location : JSON.stringify(location),
          user_agent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        });
        console.log('✅ Admin access logged with location');
      } catch (logError) {
        console.error('⚠️ Failed to log admin access:', logError);
        // Continue with login even if logging fails
      }
    }

    // Generate token
    const token = jwt.sign(
      { 
        email: admin.email, 
        role: 'admin',
        isAdmin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Admin login successful');

    return res.status(200).json({ 
      token, 
      user: { 
        email: admin.email,
        role: 'admin'
      } 
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// ✅ FIXED: Clock In with proper location storage
export const clockIn = async (req, res) => {
  try {
    const { reason, location } = req.body;
    const adminEmail = req.user.email;

    console.log('🕐 Admin clock-in:', { adminEmail, hasLocation: !!location });

    const logData = {
      admin_email: adminEmail,
      action: 'clock_in',
      reason: reason || 'Daily admin access',
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };

    // Store location properly
    if (location) {
      logData.location = typeof location === 'string' ? location : JSON.stringify(location);
    }

    await supabase.from('admin_logs').insert(logData);

    console.log('✅ Clock-in successful');

    res.json({ 
      success: true, 
      message: 'Clocked in successfully',
      timestamp: logData.timestamp
    });
  } catch (error) {
    console.error('❌ Clock in error:', error);
    res.status(500).json({ error: 'Clock in failed' });
  }
};

// ✅ FIXED: Get All Students with proper error handling
export const getAllStudents = async (req, res) => {
  try {
    console.log('📚 Fetching all students...');

    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Fetched ${students?.length || 0} students`);
    res.json(students || []);
  } catch (error) {
    console.error('❌ Fetch students error:', error);
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
};

// ✅ FIXED: Get All Staff
export const getAllStaff = async (req, res) => {
  try {
    console.log('👥 Fetching all staff...');

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Fetched ${staff?.length || 0} staff members`);
    res.json(staff || []);
  } catch (error) {
    console.error('❌ Fetch staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff', details: error.message });
  }
};

// ✅ FIXED: Get Dashboard Stats with proper calculations
export const getStats = async (req, res) => {
  try {
    console.log('📊 Calculating dashboard stats...');

    // Get students stats
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('status, payment_status, programme');

    if (studentsError) throw studentsError;

    // Get staff stats
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('status');

    if (staffError) throw staffError;

    const totalStudents = students?.length || 0;
    const pendingStudents = students?.filter(s => s.status === 'pending').length || 0;
    const activeStudents = students?.filter(s => s.status === 'active').length || 0;
    const suspendedStudents = students?.filter(s => s.status === 'suspended').length || 0;
    
    const totalStaff = staff?.length || 0;
    const activeStaff = staff?.filter(s => s.status === 'active').length || 0;
    
    const pendingPayments = students?.filter(s => 
      s.payment_status === 'unpaid' || !s.payment_status
    ).length || 0;
    
    // Calculate total revenue (₦10,000 for O-Level, ₦25,750 for A-Level)
    const totalRevenue = students?.reduce((sum, student) => {
      if (student.payment_status === 'paid') {
        const amount = student.programme === 'O-Level' ? 10000 : 25750;
        return sum + amount;
      }
      return sum;
    }, 0) || 0;

    const stats = {
      totalStudents,
      pendingStudents,
      activeStudents,
      suspendedStudents,
      totalStaff,
      activeStaff,
      pendingPayments,
      totalRevenue
    };

    console.log('✅ Stats calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Fetch stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats', 
      details: error.message,
      // Return zeros on error to prevent UI break
      totalStudents: 0,
      pendingStudents: 0,
      activeStudents: 0,
      suspendedStudents: 0,
      totalStaff: 0,
      activeStaff: 0,
      pendingPayments: 0,
      totalRevenue: 0
    });
  }
};

// ✅ FIXED: Validate Student
export const validateStudent = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    console.log('✓ Validating student:', { studentId, status });

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "active" or "rejected"' });
    }

    const { data, error } = await supabase
      .from('students')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'validate_student',
      details: JSON.stringify({ studentId, status }),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Student validated successfully');
    res.json({ success: true, student: data });
  } catch (error) {
    console.error('❌ Validate student error:', error);
    res.status(500).json({ error: 'Validation failed', details: error.message });
  }
};

// ✅ FIXED: Suspend Account
export const suspendAccount = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;

    console.log('🚫 Suspending account:', { accountId, accountType });

    if (!['student', 'staff'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    const table = accountType === 'student' ? 'students' : 'staff';
    const idField = accountType === 'student' ? 'student_id' : 'staff_id';

    const { data, error } = await supabase
      .from(table)
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq(idField, accountId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'suspend_account',
      details: JSON.stringify({ accountId, accountType }),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Account suspended successfully');
    res.json({ success: true, account: data });
  } catch (error) {
    console.error('❌ Suspend account error:', error);
    res.status(500).json({ error: 'Suspension failed', details: error.message });
  }
};

// ✅ FIXED: Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;

    console.log('🗑️ Deleting account:', { accountId, accountType });

    if (!['student', 'staff'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    const table = accountType === 'student' ? 'students' : 'staff';
    const idField = accountType === 'student' ? 'student_id' : 'staff_id';

    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idField, accountId);

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'delete_account',
      details: JSON.stringify({ accountId, accountType }),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Account deleted successfully');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ error: 'Deletion failed', details: error.message });
  }
};

// ✅ FIXED: Generate Staff Verification Code
export const generateStaffCode = async (req, res) => {
  try {
    console.log('🔑 Generating staff verification code...');

    const code = 'MRT' + Array.from({ length: 5 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6);

    const { data, error } = await supabase
      .from('verification_codes')
      .insert({
        code,
        type: 'staff',
        expires_at: expiresAt.toISOString(),
        used: false,
        created_by: req.user.email,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'generate_staff_code',
      details: JSON.stringify({ code }),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Staff code generated:', code);
    res.json({ 
      success: true, 
      code: data.code, 
      expiresAt: data.expires_at 
    });
  } catch (error) {
    console.error('❌ Generate code error:', error);
    res.status(500).json({ error: 'Code generation failed', details: error.message });
  }
};
