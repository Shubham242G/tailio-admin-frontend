'use client';

import { useState } from 'react';
import type { FAQ } from '../types/faq';

interface FAQTableProps {
  data: FAQ[];
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'General': 'bg-indigo-500',
    'Getting Started': 'bg-purple-500',
    'Pricing': 'bg-pink-500',
    'Documents': 'bg-teal-500',
    'Company': 'bg-amber-500',
    'Delivery': 'bg-blue-500',
    'Digital Services': 'bg-purple-500',
    'Process': 'bg-emerald-500',
    'Support': 'bg-red-500',
    'Payment': 'bg-purple-500',
    'Contact': 'bg-cyan-500'
  };
  return colors[category] || 'bg-gray-500';
};

const getPageLabel = (pageId: string): string => {
  return pageId.charAt(0).toUpperCase() + pageId.slice(1);
};

export default function FAQTable({ 
  data, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onBulkDelete 
}: FAQTableProps) {
  const [selectedFAQs, setSelectedFAQs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFAQs(data.map(f => f._id));
      setSelectAll(true);
    } else {
      setSelectedFAQs([]);
      setSelectAll(false);
    }
  };

  const handleSelectFAQ = (id: string) => {
    setSelectedFAQs(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(fid => fid !== id) 
        : [...prev, id];
      setSelectAll(newSelection.length === data.length);
      return newSelection;
    });
  };

  return (
    <div className="overflow-x-auto">
      {selectedFAQs.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-orange-50 border-b border-orange-200">
          <span className="text-sm text-orange-700 font-medium">
            {selectedFAQs.length} FAQ{selectedFAQs.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => onBulkDelete(selectedFAQs)}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}
      
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectAll}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Page</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 hidden md:table-cell">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 hidden sm:table-cell">Order</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 hidden sm:table-cell">Views</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((faq, index) => (
            <tr key={faq._id} className={`hover:bg-gray-50 transition ${!faq.isActive ? 'opacity-60' : ''}`}>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedFAQs.includes(faq._id)}
                  onChange={() => handleSelectFAQ(faq._id)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
              <td className="px-4 py-3">
                <div className={`text-sm font-medium text-gray-900 ${!faq.isActive ? 'line-through' : ''}`}>
                  {faq.question}
                </div>
                {faq.category && (
                  <span className="text-xs text-gray-400 md:hidden">
                    {faq.category}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  {getPageLabel(faq.pageId)}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className={`px-2 py-1 text-white rounded text-xs font-medium ${getCategoryColor(faq.category)}`}>
                  {faq.category || 'General'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 text-center hidden sm:table-cell">
                {faq.order || 0}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 text-center hidden sm:table-cell">
                {faq.views || 0}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleStatus(faq._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    faq.isActive 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {faq.isActive ? '✅ Active' : '⛔ Inactive'}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(faq)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(faq._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}