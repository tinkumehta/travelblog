import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    console.log('🔐 Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('✅ Token verified for user:', decodedToken.email);

    // Find user
    const user = await User.findById(decodedToken.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: error.message 
    });
  }
};

export default auth;