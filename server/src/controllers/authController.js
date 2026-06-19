
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating accessToken and refreshToken")
    }
}

 export const register = asyncHandler(async (req, res) => {

        const { username, email, password } = req.body

        // validation
        if ([username, email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(401, "All fields are required")
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new ApiError(400, "User already exists")
        }

        // Create user
       
        const user = await User.create({
            
            username: username.toLowerCase(),
            email,
            password,
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong registering user")
        }

       

        return res.status(201).json(
            new ApiResponse(201, createdUser, "User created successfully")
        )
   
})

 export  const login = asyncHandler(async (req, res) => {
    // req body -> username, email, password
    // find the user
    // check password
    // access and referesh token
    // send cookie

    const {email, username, password} = req.body

    if(! (email) && ! (username)){
        throw new ApiError(401, "email and username is required")
    }

    const user  = await User.findOne({
        $or : [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(400, "User does'nt exits")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "User password is not correcty")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const OPTIONS ={
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .json(
        new ApiResponse(
            200, 
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )
})

/*
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

import dotenv from 'dotenv';

dotenv.config();


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
    const user = await User.findOne({
  email: email.trim().toLowerCase(),
});

if (!user) {
  return res.status(401).json({
    error: "User not found",
  });
}

const isValidPassword = await bcrypt.compare(
  password,
  user.password
);

if (!isValidPassword) {
  return res.status(401).json({
    error: "Invalid credentials",
  });
}
    
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

*/