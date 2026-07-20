const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔍 API_BASE:', API_BASE);

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Remove any leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  
  console.log('🔍 Making request to:', url);
  
  const token = localStorage.getItem('token');
  
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

// Generic apiFetch function for use in components
export async function apiFetch(endpoint: string, method: string = 'GET', data?: any, token?: string | null) {
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

  return apiRequest(endpoint, options);
}

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
    // Dashboard
    getStats: () => apiRequest('/admin/dashboard/stats', { method: 'GET' }),
    
    // Customers
    getCustomers: async () => {
      const response = await apiRequest('/admin/customers', { method: 'GET' });
      // Handle paginated response
      if (response && response.customers) {
        return response.customers;
      }
      return Array.isArray(response) ? response : [];
    },
    getCustomer: (id: string) => apiRequest(`/admin/customers/${id}`, { method: 'GET' }),
    
    // Pets
    getPets: async () => {
      const response = await apiRequest('/admin/pets', { method: 'GET' });
      // Handle paginated response
      if (response && response.pets) {
        return response.pets;
      }
      return Array.isArray(response) ? response : [];
    },
    getPet: (id: string) => apiRequest(`/admin/pets/${id}`, { method: 'GET' }),
    
    // Registrations
    getRegistrations: async () => {
      const response = await apiRequest('/admin/registrations', { method: 'GET' });
      // Handle paginated response
      if (response && response.registrations) {
        return response.registrations;
      }
      return Array.isArray(response) ? response : [];
    },
    getRegistration: (id: string) => apiRequest(`/admin/registrations/${id}`, { method: 'GET' }),
    
    // Registration Management
    updateRegistrationStage: (petId: string, stage: number) =>
      apiRequest(`/admin/pets/${petId}/registration-stage`, { method: 'PUT', body: JSON.stringify({ stage }) }),
    
    // License Management
    issueLicense: (petId: string, licenseData: any) =>
      apiRequest(`/admin/pets/${petId}/license`, { method: 'POST', body: JSON.stringify(licenseData) }),
    getLicense: (petId: string) => apiRequest(`/admin/pets/${petId}/license`, { method: 'GET' }),
    
    // Documents
    getPendingDocuments: async () => {
      const response = await apiRequest('/admin/documents/pending', { method: 'GET' });
      return Array.isArray(response) ? response : [];
    },
    getRegistrationDocuments: (registrationId: string) =>
      apiRequest(`/admin/registrations/${registrationId}/documents`, { method: 'GET' }),
  },
};