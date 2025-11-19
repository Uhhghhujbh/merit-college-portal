// backend/src/controllers/parent.controller.js - FIXED VERSION
import { supabase } from '../config/supabase.js';

// ✅ FIXED: Parent can only LOGIN (no registration needed)
// Parents login using their child's Student ID + Surname
export const parentLogin = async (req, res) => {
  try {
    const { studentId, surname } = req.body;

    console.log('👨‍👩‍👧 Parent login attempt:', { studentId, surname });

    if (!studentId || !surname) {
      return res.status(400).json({ error: 'Student ID and surname are required' });
    }

    // Find student by ID and verify surname (case-insensitive)
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .ilike('surname', surname)
      .single();

    if (error || !student) {
      console.log('❌ Invalid credentials or student not found');
      return res.status(401).json({ 
        error: 'Invalid credentials. Please check Student ID and surname.' 
      });
    }

    // Check if student account is active
    if (student.status !== 'active') {
      return res.status(403).json({ 
        error: `Student account is ${student.status}. Please contact administration.` 
      });
    }

    console.log('✅ Parent authenticated for student:', student.student_id);

    const token = jwt.sign(
      { 
        studentId: student.student_id,
        studentName: student.full_name,
        role: 'parent'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Parents get 24h sessions
    );

    res.json({
      token,
      student: {
        id: student.student_id,
        name: student.full_name,
        programme: student.programme,
        department: student.department,
        email: student.email,
        phone: student.phone
      }
    });
  } catch (error) {
    console.error('❌ Parent login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// ✅ FIXED: Get student data for parent view
export const getStudentByParent = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log('📊 Parent fetching student data:', studentId);

    // Verify parent is authorized to view this student
    if (req.user.studentId !== studentId) {
      console.log('❌ Parent not authorized for this student');
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }

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
        status,
        payment_status,
        subjects,
        registration_date,
        photo_url
      `)
      .eq('student_id', studentId)
      .single();

    if (error || !student) {
      console.log('❌ Student not found');
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch actual performance data (replace with real assessment data when available)
    // For now, return student info with placeholder for performance
    const studentData = {
      ...student,
      // These will be populated from actual assessment records later
      subjects: student.subjects ? student.subjects.map((subject, index) => ({
        name: subject,
        // TODO: Fetch from assessments table
        grade: null,
        percentage: null,
        teacher: null
      })) : [],
      attendance: null, // TODO: Fetch from attendance table
      overallGrade: null, // TODO: Calculate from assessments
      overallPercentage: null // TODO: Calculate from assessments
    };

    console.log('✅ Student data fetched for parent');
    res.json(studentData);
  } catch (error) {
    console.error('❌ Parent fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student data', details: error.message });
  }
};

// ✅ NEW: Get student reports for parent
export const getStudentReports = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify parent authorization
    if (req.user.studentId !== studentId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // TODO: Fetch from reports table when implemented
    // For now return empty array
    const reports = [];

    res.json(reports);
  } catch (error) {
    console.error('❌ Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};
