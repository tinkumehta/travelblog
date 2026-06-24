// app/blog/[id]/layout.js
export default function BlogDetailLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}