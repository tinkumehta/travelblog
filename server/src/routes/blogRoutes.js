// server/src/routes/blogRoutes.js
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

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    fieldSize: 10 * 1024 * 1024, // 10MB for JSON data
  },
  fileFilter: (req, file, cb) => {
    console.log('📎 File filter - mimetype:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
});

// Error handling for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field. Only "image" is allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes
router.post(
  '/', 
  auth, 
  upload.single('image'), 
  handleMulterError,
  createBlog
);

router.put(
  '/:id', 
  auth, 
  upload.single('image'), 
  handleMulterError,
  updateBlog
);

router.delete('/:id', auth, deleteBlog);

export default router;