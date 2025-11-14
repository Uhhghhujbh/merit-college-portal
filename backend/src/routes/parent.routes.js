import express from 'express';
import { getStudentByParent } from '../controllers/parent.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/student/:studentId', verifyToken, getStudentByParent);

export default router;