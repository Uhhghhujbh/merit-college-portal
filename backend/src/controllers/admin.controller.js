import { supabase } from '../config/supabase.js';

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

export const getStats = async (req, res) => {
  try {
    // Get student counts
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    const { count: pendingStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: activeStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: suspendedStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended');

    // Get staff counts
    const { count: totalStaff } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true });

    const { count: activeStaff } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Calculate pending payments
    const { count: pendingPayments } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'unpaid');

    // Mock revenue (you can calculate from actual payments later)
    const totalRevenue = 3250000;

    res.json({
      totalStudents: totalStudents || 0,
      pendingStudents: pendingStudents || 0,
      activeStudents: activeStudents || 0,
      suspendedStudents: suspendedStudents || 0,
      totalStaff: totalStaff || 0,
      activeStaff: activeStaff || 0,
      pendingPayments: pendingPayments || 0,
      totalRevenue
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const clockIn = async (req, res) => {
  try {
    const { reason, location } = req.body;
    const adminEmail = req.user.email;

    const { data, error } = await supabase
      .from('admin_logs')
      .insert({
        admin_email: adminEmail,
        action: 'clock_in',
        details: { reason },
        location,
        user_agent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Clocked in successfully', data });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Clock in failed' });
  }
};

export const validateStudent = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    const { data, error } = await supabase
      .from('students')
      .update({ status })
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'validate_student',
      details: { studentId, status },
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Student status updated', data });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
};

export const suspendAccount = async (req, res) => {
  try {
    const { id, type } = req.body;
    const table = type === 'student' ? 'students' : 'staff';
    const idField = type === 'student' ? 'student_id' : 'staff_id';

    const { data, error } = await supabase
      .from(table)
      .update({ status: 'suspended' })
      .eq(idField, id)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'suspend_account',
      details: { id, type },
      timestamp: new Date().toISOString()
    });

    res.json({ message: `${type} suspended successfully`, data });
  } catch (error) {
    console.error('Suspend error:', error);
    res.status(500).json({ error: 'Suspend failed' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id, type } = req.body;
    const table = type === 'student' ? 'students' : 'staff';
    const idField = type === 'student' ? 'student_id' : 'staff_id';

    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idField, id);

    if (error) throw error;

    // Log the action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'delete_account',
      details: { id, type },
      timestamp: new Date().toISOString()
    });

    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const generateStaffCode = async (req, res) => {
  try {
    const code = 'MRT' + Array.from({ length: 5 }, () => 
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
    ).join('');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6);

    const { data, error } = await supabase
      .from('verification_codes')
      .insert({
        code,
        type: 'staff',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await supabase.from('admin_logs').insert({
      admin_email: req.user.email,
      action: 'generate_staff_code',
      details: { code },
      timestamp: new Date().toISOString()
    });

    res.json({ code, expiresAt: data.expires_at });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
};
