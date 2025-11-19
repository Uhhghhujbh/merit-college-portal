// import jwt from 'jsonwebtoken';

// export const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

// export const verifyAdmin = (req, res, next) => {
//   const validAdmins = process.env.ADMIN_EMAILS.split(',');
  
//   if (!validAdmins.includes(req.user.email)) {
//     return res.status(403).json({ error: 'Admin access required' });
//   }
  
//   next();
// };

// export const verifyStaff = (req, res, next) => {
//   if (req.user.role !== 'staff') {
//     return res.status(403).json({ error: 'Staff access required' });
//   }
//   next();
// };





// backend/src/middleware/auth.middleware.js - COMPLETE FIXED VERSION
import jwt from 'jsonwebtoken';

// ✅ FIXED: Verify Token with better error handling
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token in authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ Token verified for:', decoded.email || decoded.id);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ FIXED: Verify Admin with proper email check
export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validAdminEmails = [
      'adewuyiayuba@gmail.com',
      'olayayemi@gmail.com'
    ];
    
    const userEmail = req.user.email?.toLowerCase();
    const isAdmin = validAdminEmails.some(email => 
      email.toLowerCase() === userEmail
    );

    if (!isAdmin && req.user.role !== 'admin') {
      console.log('❌ Not an admin:', userEmail);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('✅ Admin verified:', userEmail);
    next();
  } catch (error) {
    console.error('❌ Admin verification error:', error);
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// ✅ FIXED: Verify Staff
export const verifyStaff = (req, res, next) => {
  try {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'staff') {
      console.log('❌ Not a staff member:', req.user.email);
      return res.status(403).json({ error: 'Staff access required' });
    }

    console.log('✅ Staff verified:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Staff verification error:', error);
    return res.status(403).json({ error: 'Staff access required' });
  }
};

// ✅ NEW: Verify Student
export const verifyStudent = (req, res, next) => {
  try {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'student') {
      console.log('❌ Not a student:', req.user.email);
      return res.status(403).json({ error: 'Student access required' });
    }

    console.log('✅ Student verified:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Student verification error:', error);
    return res.status(403).json({ error: 'Student access required' });
  }
};

// ✅ NEW: Verify Parent
export const verifyParent = (req, res, next) => {
  try {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'parent') {
      console.log('❌ Not a parent:', req.user.studentId);
      return res.status(403).json({ error: 'Parent access required' });
    }

    console.log('✅ Parent verified for student:', req.user.studentId);
    next();
  } catch (error) {
    console.error('❌ Parent verification error:', error);
    return res.status(403).json({ error: 'Parent access required' });
  }
};
