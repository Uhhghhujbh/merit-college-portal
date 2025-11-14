import express from 'express';
import { verifyStaffCode, registerStaff, staffLogin } from '../controllers/staff.controller.js';

const router = express.Router();

router.post('/verify-code', verifyStaffCode);
router.post('/register', registerStaff);
router.post('/login', staffLogin);

export default router;