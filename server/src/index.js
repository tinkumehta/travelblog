import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
// import { createAdminUser } from './controllers/authController.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware - IMPORTANT: Order matters!
app.use(cors({
  origin: "https://travelblog-lemon.vercel.app" || process.env.CORS_FRONTEND,
  credentials: true,
}));



// JSON parsing middleware with error handling
app.use(express.json({ 
  limit: '10mb',
  strict: true 
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Database connection
await connectDB();

// Create admin user on server start
// await createAdminUser();

// Routes
app.use('/api', authRoutes);
app.use('/api/blogs', blogRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Travel Blog API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON payload',
      message: 'Please check your request body format',
    });
  }
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📍 http://localhost:${PORT}`);
// });

export default app;