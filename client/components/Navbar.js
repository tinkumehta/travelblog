// components/Navbar.js
'use client';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          🌍 TravelBlog
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-indigo-600 text-sm font-medium">Home</Link>
          <Link href="/blog" className="hover:text-indigo-600 text-sm font-medium">Blogs</Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/admin/dashboard" className="hover:text-indigo-600 text-sm font-medium">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/admin/login" className="hover:text-indigo-600 text-sm font-medium">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}