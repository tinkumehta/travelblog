// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(`${process.env.MONGODB_URI}/travel`)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  food: { type: String, required: true },
  places: { type: String, required: true },
  budget: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Blog = mongoose.model('Blog', BlogSchema);

// Cloudinary Config (sign up at cloudinary.com for free)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auth Middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret123');
  res.json({ token });
});

// Create Admin User
(async () => {
  const adminExists = await User.findOne({ email: process.env.LOGIN_ADMIN });
  if (!adminExists) {
    const hashed = await bcrypt.hash(process.env.LOGIN_PASSWORD, 10);
    await User.create({ email: process.env.LOGIN_ADMIN, password: hashed });
    console.log('✅ Login successfully');
  }
})();

// Create Blog
app.post('/api/blogs', auth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'blogs' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }
    const blogData = JSON.parse(req.body.data);
    const blog = await Blog.create({ ...blogData, imageUrl });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Blogs
app.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// Get Single Blog
app.get('/api/blogs/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

// Update Blog
app.put('/api/blogs/:id', auth, upload.single('image'), async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  let imageUrl = blog.imageUrl;
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'blogs' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });
    imageUrl = result.secure_url;
  }
  const updated = await Blog.findByIdAndUpdate(req.params.id, 
    { ...JSON.parse(req.body.data), imageUrl }, 
    { new: true }
  );
  res.json(updated);
});

// Delete Blog
app.delete('/api/blogs/:id', auth, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});


app.get("/", (req, res) => res.send("Travel Blog"));

export default app
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));