// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12 py-6 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} TravelBlog. All rights reserved.</p>
        <p className="text-gray-400 text-sm mt-2">Explore the world, one destination at a time.</p>
      </div>
    </footer>
  );
}