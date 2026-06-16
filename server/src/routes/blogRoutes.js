import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';

const router = express.Router();

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes (require authentication)
router.post('/', auth, upload.single('image'), createBlog);
router.put('/:id', auth, upload.single('image'), updateBlog);
router.delete('/:id', auth, deleteBlog);

export default router;