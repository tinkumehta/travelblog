// app/blog/[id]/page.js
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogAPI } from '../../../config/api';
import Loading from '../../../components/Loading';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          setLoading(true);
          const data = await blogAPI.getById(id);
          setBlog(data);
        } catch (error) {
          console.error('Error fetching blog:', error);
          setError('Failed to load blog post');
        } finally {
          setLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id]);

  if (loading) return <Loading message="Loading blog..." />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link href="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }
  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Blog not found</h2>
        <Link href="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/" className="text-indigo-600 hover:underline mb-6 inline-flex items-center gap-2">
        ← Back to Home
      </Link>

      <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
        <Image
          src={blog.imageUrl || 'https://via.placeholder.com/800x400?text=Travel+Blog'}
          alt={blog.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

      <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-2">
        <p className="text-lg"><strong>📍 Destination:</strong> {blog.destination}</p>
        <p className="text-lg"><strong>🍽️ Local Food:</strong> {blog.food}</p>
        <p className="text-lg"><strong>🏛️ Must-Visit Places:</strong> {blog.places}</p>
        <p className="text-lg"><strong>💰 Budget:</strong> {blog.budget}</p>
        {blog.link && (
          <p>
            <strong>🔗 More Info:</strong>{' '}
            <a
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Visit Website
            </a>
          </p>
        )}
      </div>

      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {blog.description || blog.places}
      </div>
    </article>
  );
}