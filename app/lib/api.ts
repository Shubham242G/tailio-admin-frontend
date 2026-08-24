// lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔍 API_BASE:', API_BASE);

export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  
  console.log('🔍 Making request to:', url);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(errorText || `API request failed with status ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function apiFetch<T = any>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  token?: string | null
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  return apiRequest<T>(endpoint, options);
}

// FAQ API endpoints
export const faqAPI = {
  // Public endpoints
  getByPage: (pageId: string, limit: number = 20) => 
    apiRequest(`/faqs/page/${pageId}?limit=${limit}`),

  getByCategory: (category: string, pageId?: string) => {
    let url = `/faqs/category/${category}`;
    if (pageId) url += `?pageId=${pageId}`;
    return apiRequest(url);
  },

  getCategories: () => 
    apiRequest('/faqs/categories'),

  getPageOptions: () => 
    apiRequest('/faqs/page-options'),

  // Admin endpoints
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiRequest(`/faqs${queryString ? `?${queryString}` : ''}`);
  },

  getStats: () => 
    apiRequest('/faqs/stats'),

  create: (data: any) => 
    apiRequest('/faqs', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) => 
    apiRequest(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => 
    apiRequest(`/faqs/${id}`, { method: 'DELETE' }),

  bulkDelete: (ids: string[]) => 
    apiRequest('/faqs/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  toggleStatus: (id: string) => 
    apiRequest(`/faqs/${id}/toggle`, { method: 'PATCH' }),

  reorder: (pageId: string, orderedIds: string[]) => 
    apiRequest('/faqs/reorder', { method: 'PUT', body: JSON.stringify({ pageId, orderedIds }) }),
};

// Export all APIs
export const api = {
  auth: {
    login: (data: { email: string; password: string }) => 
      apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => 
      apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    verify: () => 
      apiRequest('/auth/verify', { method: 'GET' }),
  },
  pets: {
    getMyPets: () => apiRequest('/pets', { method: 'GET' }),
    getPet: (id: string) => apiRequest(`/pets/${id}`, { method: 'GET' }),
    create: (data: any) => apiRequest('/pets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/pets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/pets/${id}`, { method: 'DELETE' }),
  },
  registration: {
    getStatus: (petId: string) => apiRequest(`/registration/${petId}/status`, { method: 'GET' }),
    uploadDocument: (petId: string, documentName: string, fileData: string, fileName: string, fileSize: number, mimeType: string) =>
      apiRequest(`/registration/${petId}/documents`, { 
        method: 'POST', 
        body: JSON.stringify({ documentName, fileData, fileName, fileSize, mimeType })
      }),
    deleteDocument: (petId: string, documentName: string) =>
      apiRequest(`/registration/${petId}/documents/${documentName}`, { method: 'DELETE' }),
    triggerRegistration: (petId: string) =>
      apiRequest(`/registration/${petId}/trigger-registration`, { method: 'POST' }),
  },
  admin: {
    getStats: () => apiRequest('/admin/dashboard/stats', { method: 'GET' }),
    getCustomers: async () => {
      const response = await apiRequest('/admin/customers', { method: 'GET' });
      if (response && response.customers) {
        return response.customers;
      }
      return Array.isArray(response) ? response : [];
    },
    getCustomer: (id: string) => apiRequest(`/admin/customers/${id}`, { method: 'GET' }),
    getPets: async () => {
      const response = await apiRequest('/admin/pets', { method: 'GET' });
      if (response && response.pets) {
        return response.pets;
      }
      return Array.isArray(response) ? response : [];
    },
    getPet: (id: string) => apiRequest(`/admin/pets/${id}`, { method: 'GET' }),
    getRegistrations: async () => {
      const response = await apiRequest('/admin/registrations', { method: 'GET' });
      if (response && response.registrations) {
        return response.registrations;
      }
      return Array.isArray(response) ? response : [];
    },
    getRegistration: (id: string) => apiRequest(`/admin/registrations/${id}`, { method: 'GET' }),
    updateRegistrationStage: (petId: string, stage: number) =>
      apiRequest(`/admin/pets/${petId}/registration-stage`, { method: 'PUT', body: JSON.stringify({ stage }) }),
    issueLicense: (petId: string, licenseData: any) =>
      apiRequest(`/admin/pets/${petId}/license`, { method: 'POST', body: JSON.stringify(licenseData) }),
    getLicense: (petId: string) => apiRequest(`/admin/pets/${petId}/license`, { method: 'GET' }),
    getPendingDocuments: async () => {
      const response = await apiRequest('/admin/documents/pending', { method: 'GET' });
      return Array.isArray(response) ? response : [];
    },
    getRegistrationDocuments: (registrationId: string) =>
      apiRequest(`/admin/registrations/${registrationId}/documents`, { method: 'GET' }),
  },
  faqs: faqAPI,
};