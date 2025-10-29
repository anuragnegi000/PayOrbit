import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email: string, fullName: string) => 
    api.post('/api/user/create-account', { email, fullName }),
  
  verifyOtp: (email: string, otpCode: string) =>
    api.post('/api/user/verify-otp', { email, otpCode }),
  
  sendOTP: (email: string) => 
    api.post('/api/user/create-account', { email, fullName: email.split('@')[0] }),
  
  verifyOTP: (email: string, otpCode: string) =>
    api.post('/api/user/verify-otp', { email, otpCode }),
};

export const invoiceAPI = {
  getAll: (merchantEmail: string) => api.get(`/api/invoice?merchantEmail=${encodeURIComponent(merchantEmail)}`),
  
  getById: (id: string) => api.get(`/api/invoice/${id}`),
  
  create: (data: {
    amount: number;
    currency: string;
    dueDate: string;
    payerEmail?: string;
    payerName?: string;
    description?: string;
    merchantEmail: string;
    items?: Array<{
      description: string;
      quantity: number;
      price: number;
    }>;
  }) => api.post('/api/invoice/create', data),
  
  getUserInvoices: (email: string, status?: string) =>
    api.get(`/api/invoice/user/${email}${status ? `?status=${status}` : ''}`),
  
  markAsPaid: (invoiceId: string) =>
    api.patch(`/api/invoice/${invoiceId}/status`),
  
  updateStatus: (invoiceId: string, status: string) =>
    api.patch(`/api/invoice/${invoiceId}/status`, { status }),
  
  delete: (invoiceId: string) =>
    api.delete(`/api/invoice/${invoiceId}`),
  
  // Payment tracking
  startTracking: (invoiceId: string) =>
    api.post('/api/invoice/track/start', { invoiceId }),
  
  stopTracking: (invoiceId: string) =>
    api.post(`/api/invoice/track/stop/${invoiceId}`),
  
  getTrackingStatus: (invoiceId: string) =>
    api.get(`/api/invoice/track/status/${invoiceId}`),
};
