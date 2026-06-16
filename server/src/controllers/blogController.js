import Blog from '../models/Blog.js';
import cloudinary from '../config/cloudinary.js';

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get single blog
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    console.log('📝 Creating blog...');
    console.log('📦 Body data:', req.body.data);
    console.log('📎 File:', req.file ? 'Image received' : 'No image');
    
    let imageUrl = '';

    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn('⚠️ Cloudinary not configured, using placeholder image');
      imageUrl = 'https://via.placeholder.com/800x400?text=Travel+Blog';
    } else {
      // Upload image to Cloudinary if provided
      if (req.file) {
        try {
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
          console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary upload error:', cloudinaryError.message);
          // Fallback to placeholder
          imageUrl = 'https://via.placeholder.com/800x400?text=Travel+Blog';
          console.log('⚠️ Using placeholder image');
        }
      } else {
        // No image provided, use placeholder
        imageUrl = 'https://via.placeholder.com/800x400?text=Travel+Blog';
      }
    }

    // Parse blog data
    let blogData;
    try {
      blogData = JSON.parse(req.body.data);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON data:', parseError.message);
      return res.status(400).json({ 
        error: 'Invalid JSON data', 
        message: 'Please check the format of your blog data' 
      });
    }

    const blog = await Blog.create({ ...blogData, imageUrl });
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
    console.log('📝 Updating blog:', id);
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    let imageUrl = blog.imageUrl;

    // Check if Cloudinary is properly configured
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        console.warn('⚠️ Cloudinary not configured, keeping existing image');
      } else {
        try {
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
    }

    let blogData;
    try {
      blogData = JSON.parse(req.body.data);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON data:', parseError.message);
      return res.status(400).json({ 
        error: 'Invalid JSON data', 
        message: 'Please check the format of your blog data' 
      });
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
    console.log('🗑️ Deleting blog:', id);
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
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