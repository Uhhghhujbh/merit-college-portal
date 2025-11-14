import express from 'express';
import { registerStudent, getStudentProfile, updatePassword } from '../controllers/student.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerStudent);
router.get('/profile/:id', verifyToken, getStudentProfile);
router.post('/update-password', verifyToken, updatePassword);

export default router;