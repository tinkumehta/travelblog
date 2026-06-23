// server/src/controllers/blogController.js
import Blog from '../models/Blog.js';
import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    console.log('📚 Fetching all blogs');
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${blogs.length} blogs`);
    res.json(blogs);
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get single blog
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📚 Fetching blog: ${id}`);
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      console.log('❌ Blog not found');
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    console.log('✅ Blog found');
    res.json(blog);
  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    console.log('📝 Creating blog...');
    console.log('📦 Request body:', req.body);
    console.log('📎 File:', req.file ? req.file.originalname : 'No file');
    console.log('📎 File size:', req.file ? req.file.size : 'N/A');
    
    // Check if data exists
    if (!req.body.data) {
      console.error('❌ No data field in request');
      return res.status(400).json({ 
        error: 'Missing data field',
        message: 'Please provide blog data in the "data" field'
      });
    }

    // Parse blog data
    let blogData;
    try {
      blogData = JSON.parse(req.body.data);
      console.log('✅ Parsed blog data:', blogData);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON data:', parseError.message);
      console.log('📦 Raw data:', req.body.data);
      return res.status(400).json({ 
        error: 'Invalid JSON data', 
        message: 'Please check the format of your blog data',
        details: parseError.message
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'destination', 'food', 'places', 'budget'];
    const missingFields = requiredFields.filter(field => !blogData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    let imageUrl = 'https://via.placeholder.com/800x400?text=Travel+Blog';

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('☁️ Uploading to Cloudinary...');
        
        // Check Cloudinary config
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
          console.warn('⚠️ Cloudinary not configured, using placeholder');
        } else {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'blogs' },
              (error, result) => {
                if (error) {
                  console.error('❌ Cloudinary error:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.end(req.file.buffer);
          });
          imageUrl = result.secure_url;
          console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        }
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError.message);
        // Use placeholder
        imageUrl = 'https://via.placeholder.com/800x400?text=Travel+Blog';
        console.log('⚠️ Using placeholder image');
      }
    }

    // Create blog
    const blog = await Blog.create({ 
      ...blogData, 
      imageUrl,
      destination: blogData.destination?.trim(),
      food: blogData.food?.trim(),
      budget: blogData.budget?.trim(),
    });
    
    console.log('✅ Blog created successfully:', blog._id);
    res.status(201).json(blog);
  } catch (error) {
    console.error('❌ Error creating blog:', error);
    res.status(500).json({ 
      error: 'Failed to create blog', 
      message: error.message 
    });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating blog: ${id}`);
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      console.log('❌ Blog not found');
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Parse blog data
    let blogData;
    try {
      blogData = JSON.parse(req.body.data);
      console.log('✅ Parsed blog data:', blogData);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON data:', parseError.message);
      return res.status(400).json({ 
        error: 'Invalid JSON data', 
        message: 'Please check the format of your blog data'
      });
    }

    let imageUrl = blog.imageUrl;

    // Upload new image if provided
    if (req.file) {
      try {
        console.log('☁️ Uploading new image to Cloudinary...');
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'blogs' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;
        console.log('✅ Image updated on Cloudinary:', imageUrl);
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError.message);
      }
    }

    const updated = await Blog.findByIdAndUpdate(
      id,
      { ...blogData, imageUrl },
      { new: true, runValidators: true }
    );

    console.log('✅ Blog updated successfully:', updated._id);
    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    res.status(500).json({ 
      error: 'Failed to update blog', 
      message: error.message 
    });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting blog: ${id}`);
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      console.log('❌ Blog not found');
      return res.status(404).json({ error: 'Blog not found' });
    }

    console.log('✅ Blog deleted successfully');
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    res.status(500).json({ 
      error: 'Failed to delete blog', 
      message: error.message 
    });
  }
};