const API_BASE = 'http://localhost:5000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
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
