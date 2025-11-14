import { supabase, BUCKETS } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export const verifyStaffCode = async (req, res) => {
  try {
    const { code } = req.body;

    const { data: codeData, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('code', code)
      .eq('type', 'staff')
      .eq('used', false)
      .single();

    if (error || !codeData) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Check if expired (6 hours)
    const now = new Date();
    const expiresAt = new Date(codeData.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ error: 'Code has expired' });
    }

    res.json({ valid: true, expiresAt: codeData.expires_at });
  } catch (error) {
    console.error('Code verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const registerStaff = async (req, res) => {
  try {
    const { formData, photo, verificationCode } = req.body;

    // Verify code again
    const { data: codeData } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('code', verificationCode)
      .eq('used', false)
      .single();

    if (!codeData) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Generate Staff ID
    const staffId = 'STF_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Hash password (use email as initial password)
    const hashedPassword = await bcrypt.hash(formData.email, 10);

    // Upload photo
    let photoUrl = null;
    if (photo) {
      const photoPath = `${staffId}_${Date.now()}.jpg`;
      const { data: uploadData } = await supabase.storage
        .from(BUCKETS.STAFF_PHOTOS)
        .upload(photoPath, photo);

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from(BUCKETS.STAFF_PHOTOS)
          .getPublicUrl(photoPath);
        photoUrl = urlData.publicUrl;
      }
    }

    // Insert staff record
    const { data, error } = await supabase.from('staff').insert({
      staff_id: staffId,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      qualification: formData.qualification,
      experience: formData.experience,
      employment_type: formData.employmentType,
      photo_url: photoUrl,
      status: 'active',
      password: hashedPassword,
      verification_code: verificationCode,
      location: formData.location
    }).select().single();

    if (error) throw error;

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('code', verificationCode);

    res.status(201).json({
      message: 'Registration successful',
      staffId
    });
  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
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