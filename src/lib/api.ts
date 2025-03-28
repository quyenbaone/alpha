import { supabase } from './supabase';
import { API_URL } from './config';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) throw error;

  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token ? {
      Authorization: `Bearer ${session.access_token}`
    } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Equipment
  getEquipment: () => fetchWithAuth('/equipment'),
  getEquipmentById: (id: string) => fetchWithAuth(`/equipment/${id}`),
  createEquipment: (data: any) => fetchWithAuth('/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateEquipment: (id: string, data: any) => fetchWithAuth(`/equipment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteEquipment: (id: string) => fetchWithAuth(`/equipment/${id}`, {
    method: 'DELETE',
  }),

  // Rentals
  getRentals: () => fetchWithAuth('/rentals'),
  createRental: (data: any) => fetchWithAuth('/rentals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRentalStatus: (id: string, status: string) => fetchWithAuth(`/rentals/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  // Users
  getUsers: () => fetchWithAuth('/users'),
  updateUser: (id: string, data: any) => fetchWithAuth(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};