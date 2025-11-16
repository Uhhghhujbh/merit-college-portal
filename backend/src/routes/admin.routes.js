import express from 'express';
import { 
  getAllStudents, 
  getAllStaff,
  getStats,
  clockIn,
  validateStudent, 
  suspendAccount,
  generateStaffCode, 
  deleteAccount 
} from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);
router.use(verifyAdmin);

// Dashboard routes
router.get('/students', getAllStudents);
router.get('/staff', getAllStaff);
router.get('/stats', getStats);

// Admin actions
router.post('/clock-in', clockIn);
router.post('/students/validate', validateStudent);
router.post('/suspend-account', suspendAccount);
router.post('/delete-account', deleteAccount);
router.post('/staff/generate-code', generateStaffCode);

export default router;
