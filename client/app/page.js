// client/app/page.js (Homepage)
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/blogs')
      .then(res => res.json())
      .then(setBlogs)
      .catch(err => console.log('Server not running yet:', err));
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog?.destination?.toLowerCase().includes(search.toLowerCase()) ||
    blog?.title?.toLowerCase().includes(search.toLowerCase())
  );

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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="relative h-48">
                <Image 
                  src={blog.imageUrl} 
                  alt={blog.title} 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                <p className="text-gray-600 mb-2">📍 {blog.destination}</p>
                <p className="text-gray-500 text-sm mb-3">{blog.places?.substring(0, 100)}...</p>
                <Link href={`/blog/${blog._id}`} className="text-indigo-600 font-semibold hover:underline">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
        {blogs.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No blogs yet. Login as admin to add your first blog!
          </p>
        )}
      </section>
    </main>
  );
}