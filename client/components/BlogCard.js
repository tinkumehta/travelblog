// components/BlogCard.js
import Image from 'next/image';
import Link from 'next/link';

export default function BlogCard({ blog }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-48">
        <Image
          src={blog.imageUrl || 'https://via.placeholder.com/400x300?text=Travel+Blog'}
          alt={blog.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{blog.title}</h3>
        <p className="text-gray-600 mb-2">📍 {blog.destination}</p>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{blog.places?.substring(0, 100)}...</p>
        <Link
          href={`/blog/${blog._id}`}
          className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}