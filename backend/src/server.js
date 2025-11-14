// // import express from 'express';
// // import cors from 'cors';
// // import helmet from 'helmet';
// // import dotenv from 'dotenv';
// // import rateLimit from 'express-rate-limit';

// // // Routes
// // import authRoutes from './routes/auth.routes.js';
// // import studentRoutes from './routes/student.routes.js';
// // // import staffRoutes from './routes/staff.routes.js';
// // import adminRoutes from './routes/admin.routes.js';
// // import parentRoutes from './routes/parent.routes.js';

// // dotenv.config();

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // Security Middleware
// // app.use(helmet());
// // app.use(cors({
// //   origin: process.env.NODE_ENV === 'production' 
// //     ? 'https://yourdomain.com' 
// //     : 'http://localhost:3000',
// //   credentials: true
// // }));

// // // Rate limiting
// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000, // 15 minutes
// //   max: 100 // limit each IP to 100 requests per windowMs
// // });
// // app.use('/api/', limiter);

// // // Body parsing
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // // Routes
// // app.use('/api/auth', authRoutes);
// // app.use('/api/students', studentRoutes);
// // app.use('/api/staff', staffRoutes);
// // app.use('/api/admin', adminRoutes);
// // app.use('/api/parents', parentRoutes);

// // // Health check
// // app.get('/api/health', (req, res) => {
// //   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// // });

// // // Error handling
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({ error: 'Something went wrong!' });
// // });

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });










// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import dotenv from 'dotenv';
// import rateLimit from 'express-rate-limit';

// // Routes - Only import what exists
// import authRoutes from './routes/auth.routes.js';
// import studentRoutes from './routes/student.routes.js';
// import staffRoutes from './routes/staff.routes.js';      // COMMENTED - doesn't exist yet
// import adminRoutes from './routes/admin.routes.js';      // COMMENTED - doesn't exist yet
// import parentRoutes from './routes/parent.routes.js';    // COMMENTED - doesn't exist yet

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Security Middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? 'https://yourdomain.com' 
//     : 'http://localhost:3000',
//   credentials: true
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api/', limiter);

// // Body parsing
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Routes - Only use what exists
// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/staff', staffRoutes);      // COMMENTED - doesn't exist yet
// app.use('/api/admin', adminRoutes);      // COMMENTED - doesn't exist yet
// app.use('/api/parents', parentRoutes);   // COMMENTED - doesn't exist yet

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
// });


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import staffRoutes from './routes/staff.routes.js';
import adminRoutes from './routes/admin.routes.js';
import parentRoutes from './routes/parent.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parents', parentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});