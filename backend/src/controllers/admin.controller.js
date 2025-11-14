import { supabase } from '../config/supabase.js';

export const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('registration_date', { ascending: false });

    if (error) throw error;

    res.json(students);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
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

    res.json({ message: 'Student status updated', data });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
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

    res.json({ code, expiresAt: data.expires_at });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
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

    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
};