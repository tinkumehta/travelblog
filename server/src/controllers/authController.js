import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// Register Controller
export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(401, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }

    // Create user
    const user = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});

// Login Controller
export const login = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(401, "Email or username is required");
    }

    if (!password) {
        throw new ApiError(401, "Password is required");
    }

    // Find user by email or username
    const user = await User.findOne({
        $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    // Check password
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

// Create Admin User (called on server start)
export const createAdminUser = async () => {
    try {
        console.log('🔧 Checking for admin user...');

        const adminEmail = process.env.LOGIN_ADMIN || 'admin@travelblog.com';
        const adminPassword = process.env.LOGIN_PASSWORD || 'admin123';

        const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });

        if (!adminExists) {
            const user = await User.create({
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

// Refresh Token Controller
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Logout Controller
export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});