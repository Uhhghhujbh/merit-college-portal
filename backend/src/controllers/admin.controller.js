// backend/src/controllers/admin.controller.js - COMPLETE FIXED VERSION
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password, location } = req.body;

    const validAdmins = [
      { email: 'adewuyiayuba@gmail.com', password: 'Synthase1278' },
      { email: 'olayayemi@gmail.com', password: 'Synthase1278' }
    ];

    // Direct comparison for admin (no bcrypt)
    const admin = validAdmins.find(a => a.email === email && a.password === password);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Log admin access with location
    try {
      await supabase.from('admin_logs').insert({
        admin_email: email,
        action: 'login',
        location: location ? JSON.stringify(location) : null,
        user_agent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log admin access:', logError);
      // Continue with login even if logging fails
    }

    const token = jwt.sign(
      { email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: { 
        email: admin.email,
        role: 'admin'
      } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Clock In
export const clockIn = async (req, res) => {
  try {
    const { reason, location } = req.body;
    const adminEmail = req.user.email;

    await supabase.from('admin_logs').insert({
      admin_email: adminEmail,
      action: 'clock_in',
      reason,
      location: location ? JSON.stringify(location) : null,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Clocked in successfully' });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Clock in failed' });
  }
};

// Get All Students
export const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('registration_date', { ascending: false });

    if (error) throw error;

    res.json(students || []);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get All Staff
export const getAllStaff = async (req, res) => {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(staff || []);
  } catch (error) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

// Get Dashboard Stats
export const getStats = async (req, res) => {
  try {
    // Get students stats
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('status, payment_status');

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
    
    const pendingPayments = students?.filter(s => s.payment_status === 'unpaid').length || 0;
    
    // Calculate total revenue (10k for O-Level, 25.75k for A-Level)
    const totalRevenue = students?.reduce((sum, student) => {
      if (student.payment_status === 'paid') {
        return sum + (student.programme === 'O-Level' ? 10000 : 25750);
      }
      return sum;
    }, 0) || 0;

    res.json({
      totalStudents,
      pendingStudents,
      activeStudents,
      suspendedStudents,
      totalStaff,
      activeStaff,
      pendingPayments,
      totalRevenue
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Validate Student
export const validateStudent = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
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

    res.json({ success: true, student: data });
  } catch (error) {
    console.error('Validate student error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
};

// Suspend Account
export const suspendAccount = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;

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

    res.json({ success: true, account: data });
  } catch (error) {
    console.error('Suspend account error:', error);
    res.status(500).json({ error: 'Suspension failed' });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const { accountId, accountType } = req.body;

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

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
};

// Generate Staff Verification Code
export const generateStaffCode = async (req, res) => {
  try {
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

    res.json({ 
      success: true, 
      code: data.code, 
      expiresAt: data.expires_at 
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: 'Code generation failed' });
  }
};
