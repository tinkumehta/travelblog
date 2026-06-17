'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: '', destination: '', food: '', places: '', budget: '', link: '', description: ''
  });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/admin/login');
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const res = await fetch('https://travelserver-navy.vercel.app/api/blogs');
    const data = await res.json();
    setBlogs(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('data', JSON.stringify(form));
    if (image) formData.append('image', image);

    const url = editingId ? `https://travelserver-navy.vercel.app/api/blogs/${editingId}` : 'https://travelserver-navy.vercel.app/api/blogs';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (res.ok) {
      setForm({ title: '', destination: '', food: '', places: '', budget: '', link: '', description: '' });
      setImage(null);
      setEditingId(null);
      fetchBlogs();
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`https://travelserver-navy.vercel.app/api/blogs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchBlogs();
  };

  const handleEdit = (blog) => {
    setForm(blog);
    setEditingId(blog._id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all duration-200";

  const labelClass =
    "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-600">Administrator</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">

        {/* ── Page Header ── */}
        <div className="mb-8 pt-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your travel blog content</p>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Blogs', value: blogs.length, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            { label: 'Destinations', value: [...new Set(blogs.map(b => b.destination))].length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 00-8-8z"/></svg> },
            { label: 'With Images', value: blogs.filter(b => b.image).length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
            { label: 'With Links', value: blogs.filter(b => b.link).length, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Form Panel ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">

              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {editingId
                      ? <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></>
                      : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                    }
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{editingId ? 'Edit Blog' : 'New Blog'}</p>
                  <p className="text-xs text-gray-400">{editingId ? 'Update existing post' : 'Create a new post'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" placeholder="Enter blog title" value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    className={inputClass} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Destination</label>
                    <input type="text" placeholder="e.g. Paris" value={form.destination}
                      onChange={e => setForm({...form, destination: e.target.value})}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Budget</label>
                    <input type="text" placeholder="e.g. $500" value={form.budget}
                      onChange={e => setForm({...form, budget: e.target.value})}
                      className={inputClass} required />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Local Food</label>
                  <input type="text" placeholder="Famous local cuisines" value={form.food}
                    onChange={e => setForm({...form, food: e.target.value})}
                    className={inputClass} required />
                </div>

                <div>
                  <label className={labelClass}>Must-Visit Places</label>
                  <textarea placeholder="List key attractions..." value={form.places}
                    onChange={e => setForm({...form, places: e.target.value})}
                    className={`${inputClass} resize-none`} rows="2" required />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea placeholder="Write a short description..." value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className={`${inputClass} resize-none`} rows="3" />
                </div>

                <div>
                  <label className={labelClass}>External Link</label>
                  <input type="url" placeholder="https://..." value={form.link}
                    onChange={e => setForm({...form, link: e.target.value})}
                    className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Cover Image</label>
                  <div className="relative">
                    <input type="file" accept="image/*"
                      onChange={e => setImage(e.target.files[0])}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer focus:outline-none" />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit"
                    className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-150 active:scale-[0.98] ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {editingId
                        ? <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                      }
                    </svg>
                    {editingId ? 'Update Blog' : 'Publish Blog'}
                  </button>
                  {editingId && (
                    <button type="button"
                      onClick={() => { setEditingId(null); setForm({ title: '', destination: '', food: '', places: '', budget: '', link: '', description: '' }); }}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-150">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* ── Blog List Panel ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">All Posts</p>
                  <p className="text-xs text-gray-400 mt-0.5">{blogs.length} blog{blogs.length !== 1 ? 's' : ''} published</p>
                </div>
                <button onClick={fetchBlogs}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>

              {blogs.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No blogs yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first post using the form</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {blogs.map((blog, index) => (
                    <div key={blog._id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors duration-150">
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-gray-200 pt-0.5 flex-shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{blog.title}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {blog.destination && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[11px] font-semibold">
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 00-8-8z"/>
                                  </svg>
                                  {blog.destination}
                                </span>
                              )}
                              {blog.budget && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[11px] font-semibold">
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                                  </svg>
                                  {blog.budget}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleEdit(blog)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-95 transition-all duration-150">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(blog._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 active:scale-95 transition-all duration-150">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}