import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import all your controllers
import { studentLogin, parentLogin, adminLogin } from '../src/controllers/auth.controller.js';
import { registerStudent, getStudentProfile, updatePassword } from '../src/controllers/student.controller.js';
import { verifyStaffCode, registerStaff, staffLogin } from '../src/controllers/staff.controller.js';
import { 
  getAllStudents, 
  getAllStaff,
  getStats,
  clockIn,
  validateStudent, 
  suspendAccount,
  generateStaffCode, 
  deleteAccount 
} from '../src/controllers/admin.controller.js';
import { getStudentByParent } from '../src/controllers/parent.controller.js';
import { verifyToken, verifyAdmin, verifyStaff } from '../src/middleware/auth.middleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ AUTH ROUTES ============
app.post('/api/auth/student/login', studentLogin);
app.post('/api/auth/parent/login', parentLogin);
app.post('/api/auth/admin/login', adminLogin);

// ============ STUDENT ROUTES ============
app.post('/api/students/register', registerStudent);
app.get('/api/students/profile/:id', verifyToken, getStudentProfile);
app.post('/api/students/update-password', verifyToken, updatePassword);

// ============ STAFF ROUTES ============
app.post('/api/staff/verify-code', verifyStaffCode);
app.post('/api/staff/register', registerStaff);
app.post('/api/staff/login', staffLogin);

// ============ ADMIN ROUTES ============
app.get('/api/admin/students', verifyToken, verifyAdmin, getAllStudents);
app.get('/api/admin/staff', verifyToken, verifyAdmin, getAllStaff);
app.get('/api/admin/stats', verifyToken, verifyAdmin, getStats);
app.post('/api/admin/clock-in', verifyToken, verifyAdmin, clockIn);
app.put('/api/admin/students/:studentId/validate', verifyToken, verifyAdmin, validateStudent);
app.put('/api/admin/students/:id/suspend', verifyToken, verifyAdmin, suspendAccount);
app.put('/api/admin/staff/:id/suspend', verifyToken, verifyAdmin, suspendAccount);
app.delete('/api/admin/students/:id', verifyToken, verifyAdmin, deleteAccount);
app.delete('/api/admin/staff/:id', verifyToken, verifyAdmin, deleteAccount);
app.post('/api/admin/generate-staff-code', verifyToken, verifyAdmin, generateStaffCode);

// ============ PARENT ROUTES ============
app.get('/api/parents/student/:studentId', verifyToken, getStudentByParent);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
export default app;
