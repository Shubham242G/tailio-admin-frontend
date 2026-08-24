'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import { Plus, Loader2, HelpCircle } from 'lucide-react';
import FAQTable from '../../../components/FAQTable';
import FAQForm from '../../../components/FAQForm';
import { faqAPI } from '../../../lib/api';
import { PAGE_OPTIONS_VALUES, PAGE_OPTIONS_GROUPS } from '../../../lib/constants/pages';
import type { FAQ, FAQStats, FAQFilters, FAQFormData } from '../../../types/faq';

export default function AdminFAQsPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [stats, setStats] = useState<FAQStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FAQFilters>({
    pageId: '',
    category: '',
    isActive: '',
    search: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadFAQs();
      loadStats();
      loadCategories();
    }
  }, [isAuthenticated, token]);

  // Separate effect for filters to avoid re-running on every filter change
  useEffect(() => {
    if (isAuthenticated && token) {
      loadFAQs();
    }
  }, [filters]);

  const loadFAQs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = {};
      if (filters.pageId) params.pageId = filters.pageId;
      if (filters.category) params.category = filters.category;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      if (filters.search) params.search = filters.search;
      
      const response = await faqAPI.getAll(params);
      setFaqs(response.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load FAQs';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = async () => {
    try {
      const response = await faqAPI.getStats();
      setStats(response.data);
    } catch (err: unknown) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await faqAPI.getCategories();
      setCategories(response.data || []);
    } catch (err: unknown) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (faqData: FAQFormData): Promise<void> => {
    setError('');
    try {
      if (editingFAQ) {
        await faqAPI.update(editingFAQ._id, faqData);
      } else {
        await faqAPI.create(faqData);
      }
      await loadFAQs();
      await loadStats();
      await loadCategories();
      setShowForm(false);
      setEditingFAQ(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save FAQ';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await faqAPI.delete(id);
      await loadFAQs();
      await loadStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete FAQ';
      alert(errorMessage);
      console.error(err);
    }
  };

  const handleBulkDelete = async (ids: string[]): Promise<void> => {
    if (!confirm(`Delete ${ids.length} FAQs?`)) return;
    try {
      await faqAPI.bulkDelete(ids);
      await loadFAQs();
      await loadStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete FAQs';
      alert(errorMessage);
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string): Promise<void> => {
    try {
      await faqAPI.toggleStatus(id);
      await loadFAQs();
      await loadStats();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status';
      alert(errorMessage);
      console.error(err);
    }
  };

  const handleEdit = (faq: FAQ): void => {
    setEditingFAQ(faq);
    setShowForm(true);
  };

  const handleCloseForm = (): void => {
    setShowForm(false);
    setEditingFAQ(null);
    setError('');
  };

  const handleFilterChange = (key: keyof FAQFilters, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = (): void => {
    setFilters({
      pageId: '',
      category: '',
      isActive: '',
      search: ''
    });
  };

  const getPageLabel = (pageId: string): string => {
    const labels: Record<string, string> = {
      'home': 'Home',
      'about': 'About Us',
      'how-it-works': 'How It Works',
      'why-tailio': 'Why Tailio',
      'blog': 'Blog',
      'delhi': 'Pet Registration in Delhi',
      'noida': 'Pet Registration in Noida',
      'faridabad': 'Pet Registration in Faridabad',
      'gurugram': 'Pet Registration in Gurugram',
      'ghaziabad': 'Pet Registration in Ghaziabad',
    };
    return labels[pageId] || pageId.charAt(0).toUpperCase() + pageId.slice(1);
  };

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
              <HelpCircle className="w-8 h-8 text-orange-500" />
              FAQ Management
            </h1>
            <p className="text-gray-500 mt-1">Create, edit, and manage FAQs across different pages</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add FAQ
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-sm text-gray-500">Total FAQs</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalFAQs}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-2xl font-bold text-green-600">{stats.activeFAQs}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-sm text-gray-500">Total Views</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="text-sm text-gray-500">Pages</div>
              <div className="text-2xl font-bold text-purple-600">{stats.pageWiseCount?.length || 0}</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="🔍 Search FAQs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadFAQs();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <select
                value={filters.pageId || ''}
                onChange={(e) => handleFilterChange('pageId', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[130px]"
              >
                <option value="">All Pages</option>
                <optgroup label="Main Pages">
                  {['home', 'about', 'how-it-works', 'why-tailio'].map(page => (
                    <option key={page} value={page}>{getPageLabel(page)}</option>
                  ))}
                </optgroup>
                <optgroup label="Blog">
                  {['blog'].map(page => (
                    <option key={page} value={page}>{getPageLabel(page)}</option>
                  ))}
                </optgroup>
                <optgroup label="City Pages">
                  {['delhi', 'noida', 'faridabad', 'gurugram', 'ghaziabad'].map(page => (
                    <option key={page} value={page}>{getPageLabel(page)}</option>
                  ))}
                </optgroup>
              </select>

              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[130px]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filters.isActive || ''}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[130px]"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <button 
                onClick={loadFAQs} 
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Apply
              </button>

              <button 
                onClick={handleClearFilters} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Page-wise Stats */}
        {stats?.pageWiseCount && stats.pageWiseCount.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-2">
            {stats.pageWiseCount.map((item) => (
              <span key={item._id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {getPageLabel(item._id)}: {item.count}
              </span>
            ))}
          </div>
        )}

        {/* FAQ Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No FAQs found</h3>
              <p className="text-gray-400 mt-1">Create your first FAQ to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Create FAQ
              </button>
            </div>
          ) : (
            <FAQTable 
              data={faqs} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onBulkDelete={handleBulkDelete}
            />
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <FAQForm
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            initialData={editingFAQ}
            categories={categories}
            pageOptions={PAGE_OPTIONS_VALUES}
          />
        </div>
      )}
    </div>
  );
}