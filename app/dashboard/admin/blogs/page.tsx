'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import BlogTable from '../../../components/BlogTable';
import type { Blog } from '../../../components/BlogTable';
import BlogForm from '../../../components/BlogForm';
import { Plus, Loader2, BookOpen } from 'lucide-react';

export default function AdminBlogsPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBlogs();
    }
  }, [isAuthenticated, token]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/blog/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError('Failed to load blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (blogData: any) => {
    setError('');
    try {
      const url = editingBlog 
        ? `${API_BASE}/api/blog/${editingBlog._id}`
        : `${API_BASE}/api/blog`;
      
      const method = editingBlog ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to save blog');
      }

      await fetchBlogs();
      setShowForm(false);
      setEditingBlog(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save blog');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog post');
      console.error(err);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBlog(null);
    setError('');
  };

  // Stats
  const totalBlogs = blogs.length;
  const featuredBlogs = blogs.filter(b => b.isFeatured).length;
  const totalFAQs = blogs.reduce((acc, b) => acc + (b.faqs?.length || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-500" />
              Blog Management
            </h1>
            <p className="text-gray-500 mt-1">Create, edit, and manage blog posts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Total Posts</div>
            <div className="text-2xl font-bold text-gray-900">{totalBlogs}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Featured Posts</div>
            <div className="text-2xl font-bold text-gray-900">{featuredBlogs}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Total FAQs</div>
            <div className="text-2xl font-bold text-gray-900">{totalFAQs}</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Blog Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No blog posts yet</h3>
              <p className="text-gray-400 mt-1">Create your first blog post to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Create Post
              </button>
            </div>
          ) : (
            <BlogTable data={blogs} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <BlogForm
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            initialData={editingBlog}
          />
        </div>
      )}
    </div>
  );
}