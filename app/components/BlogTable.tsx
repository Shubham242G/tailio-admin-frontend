'use client';

export interface Blog {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  date: string;
  category: string;
  author: string;
  readTime: number;
  isFeatured: boolean;
  tags: string[];
  faqs?: Array<{ question: string; answer: string }>;
  images?: {
    thumbnail?: string;
    cover?: string;
    gallery?: string[];
  };
}

interface BlogTableProps {
  data: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Pet Law': '#B85C00',
    'Health & Vax': '#1A6B3A',
    'How-to Guides': '#2653A0',
    'News': '#A0251E',
    'Pet Tips': '#C04E06',
    'Enforcement': '#A0251E',
  };
  return colors[category] || '#7A5C40';
};

const getCategoryBgColor = (category: string) => {
  const colors: Record<string, string> = {
    'Pet Law': '#FFF4E4',
    'Health & Vax': '#E6F6ED',
    'How-to Guides': '#EEF4FF',
    'News': '#FDECEA',
    'Pet Tips': '#FFF0E4',
    'Enforcement': '#FDECEA',
  };
  return colors[category] || '#F3EDE0';
};

export default function BlogTable({ data, onEdit, onDelete }: BlogTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto p-6">
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left text-sm font-medium text-gray-700">Title</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700 hidden md:table-cell">Category</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700 hidden lg:table-cell">Author</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">Date</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700 hidden lg:table-cell">FAQs</th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-3">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-400 font-mono">/{item.slug}</div>
                {item.isFeatured && (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    ★ Featured
                  </span>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{item.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </td>
              <td className="p-3 hidden md:table-cell">
                <span style={{
                  padding: '2px 10px',
                  borderRadius: 100,
                  background: getCategoryBgColor(item.category),
                  fontSize: 11,
                  color: getCategoryColor(item.category),
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  display: 'inline-block',
                }}>
                  {item.category}
                </span>
              </td>
              <td className="p-3 text-gray-600 text-sm hidden lg:table-cell">
                {item.author}
              </td>
              <td className="p-3 text-gray-500 text-sm hidden sm:table-cell">
                {formatDate(item.date)}
              </td>
              <td className="p-3 hidden lg:table-cell">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {item.faqs?.length || 0}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
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