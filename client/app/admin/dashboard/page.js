// app/admin/dashboard/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { blogAPI } from '../../../config/api';
import Loading from '../../../components/Loading';

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: '', destination: '', food: '', places: '', budget: '', link: '', description: ''
  });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { isAuthenticated, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchBlogs();
  }, [isAuthenticated, router]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogAPI.getAll();
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📝 Submitting form...');
      
      // Validate form
      if (!form.title || !form.destination || !form.food || !form.places || !form.budget) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const blogData = {
        title: form.title.trim(),
        destination: form.destination.trim(),
        food: form.food.trim(),
        places: form.places.trim(),
        budget: form.budget.trim(),
        link: form.link?.trim() || '',
        description: form.description?.trim() || '',
      };

      console.log('📦 Blog data:', blogData);
      console.log('📎 Image:', image ? image.name : 'No image');
      
      let result;
      if (editingId) {
        result = await blogAPI.update(editingId, blogData, image, token);
        setSuccess('Blog updated successfully!');
      } else {
        result = await blogAPI.create(blogData, image, token);
        setSuccess('Blog created successfully!');
      }

      console.log('✅ Result:', result);

      // Reset form
      setForm({ title: '', destination: '', food: '', places: '', budget: '', link: '', description: '' });
      setImage(null);
      setEditingId(null);
      
      // Refresh blog list
      await fetchBlogs();
      
    } catch (error) {
      console.error('❌ Error saving blog:', error);
      setError(error.message || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      setError(null);
      await blogAPI.delete(id, token);
      setSuccess('Blog deleted successfully!');
      await fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog: ' + error.message);
    }
  };

  const handleEdit = (blog) => {
    setForm(blog);
    setEditingId(blog._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // Reset success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your travel blog content</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-indigo-600">{blogs.length}</p>
            <p className="text-sm text-gray-500">Total Blogs</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {new Set(blogs.map(b => b.destination)).size}
            </p>
            <p className="text-sm text-gray-500">Destinations</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-blue-600">
              {blogs.filter(b => b.imageUrl).length}
            </p>
            <p className="text-sm text-gray-500">With Images</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-violet-600">
              {blogs.filter(b => b.link).length}
            </p>
            <p className="text-sm text-gray-500">With Links</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">
                {editingId ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter blog title"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paris"
                      value={form.destination}
                      onChange={e => setForm({...form, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹15,000"
                      value={form.budget}
                      onChange={e => setForm({...form, budget: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local Food *
                  </label>
                  <input
                    type="text"
                    placeholder="Famous local cuisines"
                    value={form.food}
                    onChange={e => setForm({...form, food: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Must-Visit Places *
                  </label>
                  <textarea
                    placeholder="List key attractions..."
                    value={form.places}
                    onChange={e => setForm({...form, places: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows="2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Write a short description..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={form.link}
                    onChange={e => setForm({...form, link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log('📎 File selected:', file.name, file.size);
                        setImage(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  />
                  {image && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ {image.name} ({(image.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : (editingId ? 'Update Blog' : 'Publish Blog')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm({ title: '', destination: '', food: '', places: '', budget: '', link: '', description: '' });
                        setImage(null);
                        setError(null);
                      }}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Blog List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold">All Posts ({blogs.length})</h2>
                <button
                  onClick={fetchBlogs}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                  title="Refresh"
                >
                  🔄
                </button>
              </div>

              {blogs.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-gray-500">No blogs yet</p>
                  <p className="text-sm text-gray-400">Create your first post using the form</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {blogs.map((blog) => (
                    <div key={blog._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{blog.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                              📍 {blog.destination}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                              💰 {blog.budget}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(blog)}
                            className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}