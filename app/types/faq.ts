// types/faq.ts

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  pageId: string;
  category: string;
  order: number;
  isActive: boolean;
  views: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FAQFormData {
  question: string;
  answer: string;
  pageId: string;
  category: string;
  order: number;
  isActive: boolean;
}

export interface FAQStats {
  totalFAQs: number;
  activeFAQs: number;
  inactiveFAQs: number;
  totalViews: number;
  pageWiseCount: Array<{
    _id: string;
    count: number;
  }>;
  categoryWiseCount: Array<{
    _id: string;
    count: number;
  }>;
}

// 🔥 FIX: Make isActive strictly a string for filters
export interface FAQFilters {
  pageId?: string;
  category?: string;
  isActive?: string;  // Changed from 'string | boolean' to 'string'
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type PageOption = {
  value: string;
  label: string;
};