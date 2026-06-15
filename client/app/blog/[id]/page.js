'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/blogs/${id}`)
        .then(res => res.json())
        .then(setBlog);
    }
  }, [id]);

  if (!blog) return <div className="container mx-auto p-8 text-center">Loading...</div>;

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Home
      </Link>
      <div className="relative h-96 rounded-xl overflow-hidden mb-6">
        <Image 
          src={blog.imageUrl || 'https://via.placeholder.com/800x400'} 
          alt={blog.title} 
          fill 
          className="object-cover"
          unoptimized
        />
      </div>
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="text-lg"><strong>📍 Destination:</strong> {blog.destination}</p>
        <p className="text-lg"><strong>🍽️ Local Food:</strong> {blog.food}</p>
        <p className="text-lg"><strong>🏛️ Must-Visit Places:</strong> {blog.places}</p>
        <p className="text-lg"><strong>💰 Budget:</strong> {blog.budget}</p>
        {blog.link && (
          <p><strong>🔗 More Info:</strong> <a href={blog.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600">Visit Website</a></p>
        )}
      </div>
      <p className="text-gray-700 leading-relaxed">{blog.description || blog.places}</p>
    </article>
  );
}