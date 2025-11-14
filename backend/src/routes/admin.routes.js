import express from 'express';
import { getAllStudents, validateStudent, generateStaffCode, deleteAccount } from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(verifyAdmin);

router.get('/students', getAllStudents);
router.post('/students/validate', validateStudent);
router.post('/staff/generate-code', generateStaffCode);
router.post('/delete-account', deleteAccount);

export default router;