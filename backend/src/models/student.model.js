import { supabase } from '../config/supabase.js';

export class StudentModel {
  static async create(studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByStudentId(studentId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateStatus(studentId, status) {
    const { data, error } = await supabase
      .from('students')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('student_id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findAll(filters = {}) {
    let query = supabase.from('students').select('*');
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.programme) query = query.eq('programme', filters.programme);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async delete(studentId) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('student_id', studentId);
    
    if (error) throw error;
    return true;
  }

  static async updatePassword(studentId, hashedPassword) {
    const { data, error } = await supabase
      .from('students')
      .update({ password: hashedPassword })
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data;
  }
}