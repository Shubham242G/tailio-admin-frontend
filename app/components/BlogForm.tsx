'use client';

import { useState, useEffect, useCallback } from 'react';
import TipTapEditor from './TipTapEditor';

interface BlogFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any | null;
}

const CATEGORIES = ['Pet Law', 'Health & Vax', 'How-to Guides', 'News', 'Pet Tips', 'Enforcement'];

const titleToSlug = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function BlogForm({ onSubmit, onClose, initialData = null }: BlogFormProps) {
  const [form, setForm] = useState({
    title: '',
    summary: '',
    date: '',
    slug: '',
    category: 'Pet Tips',
    author: 'Tailio Editorial',
    readTime: 5,
    isFeatured: false,
    seoFocusKeyword: '',
    seoTitle: '',
    seoMetaDescription: ''
  });
  const [content, setContent] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // FAQ handlers
  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Tag handlers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => {
      const newForm = { 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      };
      if (name === 'title' && !slugTouched) {
        newForm.slug = titleToSlug(value);
      }
      return newForm;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: titleToSlug(e.target.value) }));
  };

  const generateSlugFromTitle = useCallback(() => {
    setForm((prev) => ({ 
      ...prev, 
      slug: titleToSlug(prev.title) 
    }));
    setSlugTouched(false);
  }, []);

  // Handle banner image upload
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await convertToBase64(file);
      setBannerImage(base64);
      setBannerPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Banner image conversion error:', error);
    }
    setLoading(false);
  };

  // Handle gallery images upload
  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    const newImages: string[] = [];
    const newPreviews: string[] = [];
    for (const file of files) {
      try {
        const base64 = await convertToBase64(file);
        newImages.push(base64);
        newPreviews.push(URL.createObjectURL(file));
      } catch (error) {
        console.error('Gallery image conversion error:', error);
      }
    }
    setGalleryImages([...galleryImages, ...newImages]);
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    setLoading(false);
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    const newPreviews = [...galleryPreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);
  };

  const removeBannerImage = () => {
    setBannerImage(null);
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imagesObj = {
      cover: bannerImage || '',
      thumbnail: bannerImage || '',
      gallery: galleryImages
    };
    const formWithImages = {
      ...form,
      content,
      tags,
      images: imagesObj,
      faqs,
      date: new Date(form.date)
    };
    onSubmit(formWithImages);
  };

  useEffect(() => {
    if (!initialData) return;
    setForm({
      title: initialData.title || '',
      summary: initialData.summary || '',
      slug: initialData.slug || titleToSlug(initialData.title),
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      category: initialData.category || 'Pet Tips',
      author: initialData.author || 'Tailio Editorial',
      readTime: initialData.readTime || 5,
      isFeatured: initialData.isFeatured || false,
      seoFocusKeyword: initialData.seoFocusKeyword || '',
      seoTitle: initialData.seoTitle || '',
      seoMetaDescription: initialData.seoMetaDescription || ''
    });
    setSlugTouched(!!initialData.slug);
    setContent(initialData.content || '');
    setTags(initialData.tags || []);
    if (initialData.images) {
      if (initialData.images.cover || initialData.images.thumbnail) {
        setBannerImage(initialData.images.cover || initialData.images.thumbnail);
      }
      if (initialData.images.gallery && initialData.images.gallery.length) {
        setGalleryImages(initialData.images.gallery);
      }
    }
    setFaqs(initialData.faqs || []);
  }, [initialData]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [bannerPreview, galleryPreviews]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[850px] max-h-[90vh] overflow-y-auto border border-gray-100">
      <h2 className="text-2xl font-bold mb-8 text-neutral-900 border-b border-gray-200 pb-4">
        {initialData ? 'Edit Blog' : 'Add Blog'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title <span className="text-red-500">*</span></label>
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="Enter blog title" 
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200 text-lg" 
            required 
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Blog Slug <span className="text-xs text-gray-500">(URL-friendly)</span>
          </label>
          <div className="flex gap-2">
            <input 
              name="slug" 
              value={form.slug} 
              onChange={handleSlugChange} 
              placeholder="my-blog-post" 
              className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200 text-lg bg-gray-50" 
              required 
            />
            <button 
              type="button" 
              onClick={generateSlugFromTitle} 
              className="px-4 py-3 bg-[#c48e53]/20 hover:bg-[#c48e53]/30 text-[#c48e53] font-medium rounded-xl border border-[#c48e53]/30 transition-all duration-200 whitespace-nowrap text-sm"
            >
              Generate
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            URL: <code className="bg-gray-100 px-2 py-1 rounded text-[#c48e53] font-mono">/blog/{form.slug || 'your-slug'}</code>
          </p>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Summary <span className="text-red-500">*</span></label>
          <textarea 
            name="summary" 
            value={form.summary} 
            onChange={handleChange} 
            placeholder="Brief summary (shows on blog cards)" 
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] resize-vertical h-28 transition-all duration-200" 
            required 
          />
        </div>

        {/* Category & Read Time & Featured */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Read Time (min)</label>
            <input
              type="number"
              name="readTime"
              value={form.readTime}
              onChange={handleChange}
              min={1}
              max={30}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Featured</label>
            <div className="flex items-center gap-3 pt-3">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 accent-[#c48e53] cursor-pointer"
              />
              <span className="text-sm text-gray-600">Mark as featured post</span>
            </div>
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Author name"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">Blog Content <span className="text-red-500">*</span></label>
          <TipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Write your full blog content here..."
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Use <code className="bg-gray-100 px-1 rounded">[image:0]</code>, <code className="bg-gray-100 px-1 rounded">[image:1]</code> etc. to insert gallery images at specific positions in your content
          </p>
        </div>

        {/* Publish Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Publish Date <span className="text-red-500">*</span></label>
          <input 
            name="date" 
            type="date" 
            value={form.date} 
            onChange={handleChange} 
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200 cursor-pointer" 
            required 
          />
        </div>

        {/* Banner Image */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Banner / Hero Image <span className="text-xs text-gray-500">(Main featured image - full width)</span>
          </label>
          {bannerPreview ? (
            <div className="relative">
              <img src={bannerPreview} alt="Banner preview" className="w-full h-64 object-cover rounded-xl shadow-md" />
              <button type="button" onClick={removeBannerImage} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={handleBannerChange} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c48e53] file:text-white hover:file:bg-[#a07a3a] hover:border-[#c48e53]/50 cursor-pointer transition-all duration-200" />
          )}
          {bannerImage && !bannerPreview && (
            <p className="text-sm text-green-600 mt-2 font-medium">✅ Banner image loaded</p>
          )}
        </div>

        {/* Gallery Images */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Gallery Images <span className="text-xs text-gray-500">(Additional images for inline placement)</span>
          </label>
          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c48e53] file:text-white hover:file:bg-[#a07a3a] hover:border-[#c48e53]/50 cursor-pointer transition-all duration-200" />
          {galleryPreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{galleryPreviews.length} gallery image(s):</p>
              <div className="grid grid-cols-3 gap-3">
                {galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt={`Gallery ${idx + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">[image:{idx}]</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {galleryImages.length > 0 && !galleryPreviews.length && (
            <p className="text-sm text-green-600 mt-2 font-medium">✅ {galleryImages.length} gallery image(s) loaded</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type tag and press Enter"
              className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-6 py-3 bg-[#c48e53]/20 hover:bg-[#c48e53]/30 text-[#c48e53] font-medium rounded-xl border border-[#c48e53]/30 transition-all duration-200"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SEO Fields */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">SEO Focus Keyword</label>
              <input 
                name="seoFocusKeyword" 
                value={form.seoFocusKeyword} 
                onChange={handleChange} 
                placeholder="Main keyword for SEO" 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">SEO Title</label>
              <input 
                name="seoTitle" 
                value={form.seoTitle} 
                onChange={handleChange} 
                placeholder="SEO optimized title" 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] transition-all duration-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">SEO Meta Description</label>
              <textarea 
                name="seoMetaDescription" 
                value={form.seoMetaDescription} 
                onChange={handleChange} 
                placeholder="Meta description for search engines (150-160 characters)" 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#c48e53]/20 focus:border-[#c48e53] resize-vertical h-24 transition-all duration-200" 
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Blog FAQs <span className="text-xs text-gray-500">(Optional - specific to this blog)</span>
            </label>
            <button
              type="button"
              onClick={addFaq}
              className="px-6 py-2 bg-[#c48e53]/20 hover:bg-[#c48e53]/30 text-[#c48e53] font-medium rounded-xl border border-[#c48e53]/30 transition-all duration-200"
            >
              + Add FAQ
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto border p-4 rounded-xl bg-gray-50">
            {faqs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No FAQs added yet. Click "Add FAQ" to start.</p>
            ) : (
              faqs.map((faq, index) => (
                <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <input
                      value={faq.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      placeholder="Question"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c48e53]/30 focus:border-[#c48e53]"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      placeholder="Answer"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#c48e53]/30 focus:border-[#c48e53] h-20 resize-vertical"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm whitespace-nowrap self-start"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          {faqs.length > 0 && (
            <p className="text-sm text-green-600 mt-2 font-medium">✅ {faqs.length} FAQ(s) for this blog</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-gradient-to-r from-[#c48e53] to-[#a07a3a] hover:from-[#a07a3a] hover:to-[#8f6833] text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Blog' : 'Create Blog')}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-400 text-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}