import { supabase } from '../config/supabase.js';

export class StaffModel {
  static async create(staffData) {
    const { data, error } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('staff')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async updateStatus(staffId, status) {
    const { data, error } = await supabase
      .from('staff')
      .update({ status })
      .eq('staff_id', staffId);
    
    if (error) throw error;
    return data;
  }

  static async delete(staffId) {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('staff_id', staffId);
    
    if (error) throw error;
    return true;
  }
}