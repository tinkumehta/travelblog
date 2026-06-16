import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Login Controller
export const login = async (req, res) => {
  try {
    console.log('📨 Login request received');
    console.log('Body:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('⚠️ Missing credentials');
      return res.status(400).json({ 
        error: 'Email and password are required',
        details: {
          email: email ? 'provided' : 'missing',
          password: password ? 'provided' : 'missing'
        }
      });
    }

    console.log(`🔍 Looking for user: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found, checking password');
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified, generating token');
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful');
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

// Create Admin User (called on server start)
export const createAdminUser = async () => {
  try {
    console.log('🔧 Checking for admin user...');
    
    const adminEmail = process.env.LOGIN_ADMIN || 'admin@travelblog.com';
    const adminPassword = process.env.LOGIN_PASSWORD || 'admin123';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};