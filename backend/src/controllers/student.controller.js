import { supabase, BUCKETS } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { processImage } from '../../utils/imageprocessor.js'; // You already have this

// Multer is now configured in server.js — req.file is available
export const registerStudent = async (req, res) => {
  try {
    // req.body contains text fields (thanks to multer)
    const formData = req.body;

    console.log('📝 Registering student:', formData.email);

    // Generate Student ID
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const programmeCode = formData.programme === 'O-Level' ? 'O' : 'A';
    const studentId = `MCAS/SCI/${year}/${random}/${programmeCode}`;

    // Hash password (initial password = email)
    const hashedPassword = await bcrypt.hash(formData.email, 10);

    // Handle Photo Upload (real file from FormData)
    let photoUrl = null;
    if (req.file) {
      try {
        // Compress image to <250KB using sharp
        const processedBuffer = await processImage(req.file.buffer, 250);

        const photoPath = `students/${studentId}_${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKETS.STUDENT_PHOTOS)
          .upload(photoPath, processedBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError && uploadError.statusCode !== '23505') { // Ignore duplicate (rare)
          console.error('Supabase upload error:', uploadError);
          // Continue without photo
        } else {
          const { data: urlData } = supabase.storage
            .from(BUCKETS.STUDENT_PHOTOS)
            .getPublicUrl(photoPath);
          photoUrl = urlData.publicUrl;
        }
      } catch (imgErr) {
        console.error('Image processing failed:', imgErr);
        // Continue without photo
      }
    }

    // Parse location if sent as JSON string
    let locationData = null;
    if (formData.location) {
      try {
        locationData = typeof formData.location === 'string' 
          ? JSON.parse(formData.location) 
          : formData.location;
      } catch (e) {
        locationData = formData.location;
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('students')
      .insert({
        student_id: studentId,
        full_name: `${formData.surname} ${formData.middleName || ''} ${formData.lastName}`.trim(),
        surname: formData.surname,
        email: formData.email,
        phone: formData.studentPhone,
        parents_phone: formData.parentsPhone,
        programme: formData.programme,
        department: 'Science',
        subjects: formData.subjects,
        photo_url: photoUrl,
        status: 'pending',
        payment_status: 'unpaid',
        password: hashedPassword,
        location: locationData,
        registration_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(400).json({
        error: 'Registration failed',
        details: error.message
      });
    }

    console.log('✅ Student registered successfully:', studentId);

    res.status(201).json({
      message: 'Registration successful! Please wait for admin validation.',
      studentId,
      status: 'pending'
    });

  } catch (error) {
    console.error('❌ Unexpected registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET STUDENT PROFILE - FIXED & CLEAN
export const getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabase
      .from('students')
      .select(`
        student_id,
        full_name,
        surname,
        email,
        phone,
        parents_phone,
        programme,
        department,
        subjects,
        photo_url,
        status,
        payment_status,
        registration_date
      `)
      .eq('student_id', id)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// UPDATE PASSWORD - SECURE & WORKING
export const updatePassword = async (req, res) => {
  try {
    const { studentId, currentPassword, newPassword } = req.body;

    if (!studentId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get current password hash
    const { data: student, error } = await supabase
      .from('students')
      .select('password')
      .eq('student_id', studentId)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, student.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('students')
      .update({ password: hashedNew })
      .eq('student_id', studentId);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Password update failed' });
  }
};
