import express from 'express';
import { studentLogin, parentLogin, adminLogin } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/student/login', studentLogin);
router.post('/parent/login', parentLogin);
router.post('/admin/login', adminLogin);

export default router;