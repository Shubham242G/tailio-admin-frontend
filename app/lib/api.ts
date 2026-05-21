const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔍 API_BASE:', API_BASE);

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  console.log('🔍 Making request to:', `${API_BASE}${endpoint}`);
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) => 
      apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  pets: {
    getMyPets: () => apiRequest('/pets'),
    create: (data: any) => apiRequest('/pets', { method: 'POST', body: JSON.stringify(data) }),
  },
  registrationForms: {
    save: (petId: string, data: any) => 
      apiRequest(`/registration-forms/${petId}`, { method: 'POST', body: JSON.stringify(data) }),
  },
};
