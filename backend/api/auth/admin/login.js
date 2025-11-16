import { supabase } from '../../../src/config/supabase.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, location } = req.body;

    // Validate admin credentials against database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    // Fallback to hardcoded if no database
    const validAdmins = [
      { email: 'adewuyiayuba@gmail.com', password: 'Synthase1278' },
      { email: 'olayayemi@gmail.com', password: 'Synthase1278' }
    ];

    let validAdmin = null;

    if (admin && admin.password === password) {
      validAdmin = admin;
    } else {
      validAdmin = validAdmins.find(a => a.email === email && a.password === password);
    }

    if (!validAdmin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Log admin access
    try {
      await supabase.from('admin_logs').insert({
        admin_email: email,
        action: 'login',
        location,
        user_agent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log admin access:', logError);
      // Continue even if logging fails
    }

    // Generate JWT
    const token = jwt.sign(
      { email: validAdmin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '8h' }
    );

    return res.status(200).json({ 
      token, 
      admin: { email: validAdmin.email } 
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Login failed', details: error.message });
  }
}
