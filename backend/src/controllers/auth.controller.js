import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const studentLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .or(`email.eq.${identifier},student_id.eq.${identifier}`)
      .single();

    if (error || !student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (student.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active. Please wait for admin validation.' });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: student.student_id,
        name: student.full_name,
        email: student.email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !staff) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, staff.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (staff.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: staff.staff_id,
        name: staff.full_name,
        email: staff.email,
        role: 'staff'
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const parentLogin = async (req, res) => {
  try {
    const { studentId, surname } = req.body;

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .ilike('surname', surname)
      .single();

    if (error || !student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { studentId: student.student_id, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      student: {
        id: student.student_id,
        name: student.full_name,
        programme: student.programme
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ADMIN LOGIN - NO BCRYPT (uses plain text password)
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

    // Log admin access
    await supabase.from('admin_logs').insert({
      admin_email: email,
      action: 'login',
      location,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

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
