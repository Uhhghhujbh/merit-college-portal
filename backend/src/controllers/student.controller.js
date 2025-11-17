import { supabase, BUCKETS } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// ✅ REGISTER STUDENT - FIXED WITH PROPER RESPONSE
export const registerStudent = async (req, res) => {
  try {
    const { formData, photo } = req.body;

    console.log('📝 Registering student:', formData.email);

    // Generate Student ID
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const programmeCode = formData.programme === 'O-Level' ? 'O' : 'A';
    const studentId = `MCAS/SCI/${year}/${random}/${programmeCode}`;

    // Hash password (use email as initial password)
    const hashedPassword = await bcrypt.hash(formData.email, 10);

    // Upload photo to Supabase Storage
    let photoUrl = null;
    if (photo) {
      try {
        const photoPath = `${studentId}_${Date.now()}.jpg`;
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKETS.STUDENT_PHOTOS)
          .upload(photoPath, buffer, {
            contentType: 'image/jpeg'
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from(BUCKETS.STUDENT_PHOTOS)
            .getPublicUrl(photoPath);
          photoUrl = urlData.publicUrl;
        }
      } catch (photoError) {
        console.error('Photo upload error:', photoError);
        // Continue without photo
      }
    }

    // Insert student record
    const { data, error } = await supabase.from('students').insert({
      student_id: studentId,
      full_name: `${formData.surname} ${formData.middleName} ${formData.lastName}`.trim(),
      surname: formData.surname,
      email: formData.email,
      phone: formData.studentPhone,
      parents_phone: formData.parentsPhone,
      programme: formData.programme,
      department: 'Science',
      subjects: formData.subjects,
      photo_url: photoUrl,
      status: 'pending',
      password: hashedPassword,
      location: formData.location,
      registration_date: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Student registered:', studentId);

    res.status(201).json({
      message: 'Registration successful',
      studentId: studentId,
      status: 'pending',
      email: formData.email
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message 
    });
  }
};

// ✅ GET STUDENT PROFILE - FIXED
export const getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', id)
      .single();

    if (error) throw error;

    // Remove sensitive data
    delete student.password;

    res.json(student);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ✅ UPDATE PASSWORD - FIXED
export const updatePassword = async (req, res) => {
  try {
    const { studentId, currentPassword, newPassword } = req.body;

    // Verify current password
    const { data: student } = await supabase
      .from('students')
      .select('password')
      .eq('student_id', studentId)
      .single();

    const validPassword = await bcrypt.compare(currentPassword, student.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error } = await supabase
      .from('students')
      .update({ password: hashedPassword })
      .eq('student_id', studentId);

    if (error) throw error;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Password update failed' });
  }
};
