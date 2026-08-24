'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PAGE_OPTIONS_GROUPS } from '../lib/constants/pages';
import type { FAQ, FAQFormData } from '../types/faq';

interface FAQFormProps {
  onSubmit: (data: FAQFormData) => Promise<void>;
  onClose: () => void;
  initialData?: FAQ | null;
  categories: string[];
  pageOptions: string[];
}

export default function FAQForm({ 
  onSubmit, 
  onClose, 
  initialData, 
  categories, 
  pageOptions 
}: FAQFormProps) {
  const [formData, setFormData] = useState<FAQFormData>({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    pageId: initialData?.pageId || 'home',
    category: initialData?.category || 'General',
    order: initialData?.order || 0,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? '✏️ Edit FAQ' : '➕ Create New FAQ'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question *
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
            placeholder="Enter the question"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer *
          </label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Enter the answer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y"
          />
        </div>

        {/* Page & Category & Order */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page *
            </label>
            <select
              name="pageId"
              value={formData.pageId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <optgroup label="Main Pages">
                {PAGE_OPTIONS_GROUPS.main.map(page => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Blog">
                {PAGE_OPTIONS_GROUPS.blog.map(page => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="City Pages">
                {PAGE_OPTIONS_GROUPS.cities.map(page => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., General, Billing"
              list="categorySuggestions"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <datalist id="categorySuggestions">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label className="text-sm font-medium text-gray-700">Active</label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : initialData ? 'Update FAQ' : 'Create FAQ'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}