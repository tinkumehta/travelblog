import Link from "next/link";

export default async function BlogPage() {
  const res = await fetch("http://localhost:5000/api/blogs", {
    cache: "no-store",
  });

  const blogs = await res.json();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Blog</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {blogs.length} article{blogs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Latest Posts</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight tracking-tight">
              Ideas worth<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                reading.
              </span>
            </h1>
            <p className="text-base text-gray-500 mt-5 leading-relaxed max-w-lg">
              Thoughtful articles on technology, design, and the stories behind what we build.
            </p>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-100" />
      </div>

      {/* ── Blog Grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {blogs.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700">Nothing published yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon for new articles</p>
          </div>
        ) : (
          <>
            {/* ── Featured first post ── */}
            <Link
              href={`/blog/${blogs[0]._id}`}
              className="group block bg-gray-950 rounded-3xl p-8 sm:p-10 mb-6 hover:bg-gray-900 transition-colors duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/70 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Featured
                    </span>
                    <span className="text-xs text-white/30 font-mono">01</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug tracking-tight group-hover:text-blue-300 transition-colors duration-200">
                    {blogs[0].title}
                  </h2>
                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-sm text-white/40 font-medium">Read article</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-blue-500 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* ── Rest of posts ── */}
            {blogs.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blogs.slice(1).map((blog, index) => (
                  <Link
                    key={blog._id}
                    href={`/blog/${blog._id}`}
                    className="group flex flex-col justify-between bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 rounded-3xl p-6 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-8">
                      <span className="text-xs font-mono font-bold text-gray-300">
                        {String(index + 2).padStart(2, "0")}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 group-hover:bg-gray-900 group-hover:border-gray-900 flex items-center justify-center flex-shrink-0 transition-all duration-200">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:[stroke:white] transition-all duration-200">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 leading-snug transition-colors duration-200">
                      {blog.title}
                    </h2>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Footer ── */}
        {blogs.length > 0 && (
          <div className="flex items-center gap-3 mt-12 pt-8 border-t border-gray-100">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">
              {blogs.length} article{blogs.length !== 1 ? "s" : ""} total
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
        )}
      </div>
    </div>
  );
}