// server/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Login Controller
export const login = async (req, res) => {
  try {
    console.log('📨 Login request received');
    console.log('📦 Request body:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('⚠️ Missing credentials');
      return res.status(400).json({ 
        error: 'Email and password are required',
        details: { email: !!email, password: !!password }
      });
    }

    console.log(`🔍 Looking for user: ${email}`);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found, checking password');
    
    // Check password
    const isValidPassword = await user.isPasswordCorrect(password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified, generating tokens');
    
    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    console.log('✅ Login successful');
    
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
};

// Register Controller
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(201).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create Admin User
export const createAdminUser = async () => {
  try {
    console.log('🔧 Checking for admin user...');
    
    const adminEmail = process.env.LOGIN_ADMIN || 'admin@travelblog.com';
    const adminPassword = process.env.LOGIN_PASSWORD || 'admin123';
    
    const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: adminEmail.toLowerCase(),
        password: adminPassword,
      });
      console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Refresh Token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = user.generateAccessToken();

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { refreshToken: null } },
      { new: true }
    );

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};