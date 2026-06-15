// client/app/layout.js
import '../styles/globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'TravelBlog - Discover Amazing Destinations',
  description: 'Explore top travel destinations, local foods, must-visit places, budget guides and authentic travel blogs.',
  keywords: 'travel blog, destination guides, travel tips, budget travel, best travel place in india, most beautiful place in india under 5000', 
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🌍 TravelBlog
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <Link href="/blog" className="hover:text-indigo-600">Blogs</Link>
              <Link href="/admin/login" className="hover:text-indigo-600">Admin</Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-gray-800 text-white mt-12 py-6 text-center">
          <p>&copy; 2026 TravelBlog. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}