import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const auth = asyncHandler(async (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log('🔐 Auth - Token:', token ? 'Present' : 'Missing');
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request - No token provided");
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('✅ Token verified for user:', decodedToken.email || decodedToken._id);

        // Find user - using _id from token
        const user = await User.findById(decodedToken._id || decodedToken.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token - User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Auth Error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token");
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token expired");
        }
        
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export default auth;