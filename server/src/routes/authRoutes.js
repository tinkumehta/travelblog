import express from 'express';
import { 
    login, 
    register, 
    refreshAccessToken, 
    logout 
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', auth, logout);

export default router;