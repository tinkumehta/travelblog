// app/layout.js
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'TravelBlog - Discover Amazing Destinations',
  description: 'Explore top travel destinations, local foods, must-visit places, budget guides and authentic travel blogs.',
  keywords: 'travel blog, destination guides, travel tips, budget travel, best travel place in india',
  openGraph: {
    title: 'TravelBlog - Discover Amazing Destinations',
    description: 'Explore top travel destinations, local foods, must-visit places, budget guides and authentic travel blogs.',
    type: 'website',
    url: 'https://travelblog.vercel.app',
  },
};

// Separate viewport export (Next.js 15+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}