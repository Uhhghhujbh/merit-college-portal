import { supabase } from '../config/supabase.js';

export const getStudentByParent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify parent is authorized (checked in auth)
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        student_id,
        full_name,
        surname,
        email,
        phone,
        programme,
        department,
        status,
        subjects,
        registration_date
      `)
      .eq('student_id', studentId)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Mock performance data (replace with actual data from assessments table)
    const performanceData = {
      ...student,
      subjects: student.subjects ? student.subjects.map((subject, index) => ({
        name: subject,
        grade: ['A', 'B', 'A', 'B', 'A'][index % 5],
        percentage: [85, 78, 88, 75, 90][index % 5],
        teacher: ['Dr. Sarah Johnson', 'Mr. Michael Brown', 'Prof. David Lee'][index % 3]
      })) : [],
      attendance: 92,
      overallGrade: 'A',
      overallPercentage: 83.2
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Parent fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
};