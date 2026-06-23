// app/page.js
'use client';
import { useState, useEffect } from 'react';
import { blogAPI } from '../config/api';
import BlogCard from '../components/BlogCard';
import Loading from '../components/Loading';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await blogAPI.getAll();
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog?.destination?.toLowerCase().includes(search.toLowerCase()) ||
    blog?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading message="Loading blogs..." />;

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Explore the World 🌟
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover hidden gems, local cuisines, and unforgettable adventures
        </p>
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search by destination or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Popular Destinations</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
        {blogs.length === 0 && !error && (
          <p className="text-center text-gray-500 mt-8">
            No blogs yet. Login as admin to add your first blog!
          </p>
        )}
      </section>
    </main>
  );
}