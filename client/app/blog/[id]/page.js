// app/blog/[id]/page.js
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogAPI } from '../../../config/api';
import Loading from '../../../components/Loading';

export default function BlogDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Log the ID for debugging
    console.log('📚 Blog ID from params:', id);
    console.log('🌐 Current URL:', window.location.href);
    console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

    if (!id) {
      console.log('⚠️ No ID provided');
      setError('No blog ID provided');
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`📚 Fetching blog with ID: ${id}`);
        
        const data = await blogAPI.getById(id);
        console.log('✅ Blog data received:', data);
        
        if (!data) {
          setError('Blog post not found');
        } else {
          setBlog(data);
        }
      } catch (error) {
        console.error('❌ Error fetching blog:', error);
        setError(error.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Loading message="Loading blog post..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Blog</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <Link href="/" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle not found
  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Blog Not Found</h2>
          <p className="text-gray-500 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Render blog
  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
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