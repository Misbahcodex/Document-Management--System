import axios, { AxiosResponse } from 'axios';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Category,
  Folder,
  Document,
  DocumentVersion,
  AccessControl,
  CreateCategoryData,
  CreateFolderData,
  CreateDocumentData,
  GrantAccessData,
  RevokeAccessData,
  User,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  loginAdmin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/admin/login', credentials);
    return response.data;
  },

  registerAdmin: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/admin/register', data);
    return response.data;
  },

  loginUser: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/user/login', credentials);
    return response.data;
  },

  registerUser: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/user/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<{ categories: Category[] }> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<{ category: Category }> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryData): Promise<{ category: Category }> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: CreateCategoryData): Promise<{ category: Category }> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Folders API
export const foldersAPI = {
  create: async (data: CreateFolderData): Promise<{ folder: Folder }> => {
    const response = await api.post('/folders', data);
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<{ folders: Folder[] }> => {
    const response = await api.get(`/folders/category/${categoryId}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ folder: Folder }> => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateFolderData>): Promise<{ folder: Folder }> => {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  create: async (data: CreateDocumentData): Promise<{ document: Document }> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('folderId', data.folderId);
    formData.append('file', data.file);

    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getByFolder: async (folderId: string): Promise<{ documents: Document[] }> => {
    const response = await api.get(`/documents/folder/${folderId}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ document: Document }> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  update: async (id: string, data: { title: string; description?: string }): Promise<{ document: Document }> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  createVersion: async (id: string, file: File, changeLog?: string): Promise<{ version: DocumentVersion }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (changeLog) formData.append('changeLog', changeLog);

    const response = await api.post(`/documents/${id}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getVersions: async (id: string): Promise<{ versions: DocumentVersion[] }> => {
    const response = await api.get(`/documents/${id}/versions`);
    return response.data;
  },

  restoreVersion: async (id: string, versionId: string): Promise<{ version: DocumentVersion, message: string }> => {
    const response = await api.post(`/documents/${id}/versions/${versionId}/restore`);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

// Access Control API
export const accessAPI = {
  grantAccess: async (data: GrantAccessData): Promise<{ accessControl: AccessControl }> => {
    const response = await api.post('/access/grant', data);
    return response.data;
  },

  revokeAccess: async (data: RevokeAccessData): Promise<{ message: string }> => {
    const response = await api.post('/access/revoke', data);
    return response.data;
  },

  getAllUsers: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/access/users');
    return response.data;
  },

  getUserAccess: async (userId: string): Promise<{ userAccess: AccessControl[] }> => {
    const response = await api.get(`/access/users/${userId}`);
    return response.data;
  },

  getCategoryAccess: async (categoryId: string): Promise<{ categoryAccess: AccessControl[] }> => {
    const response = await api.get(`/access/categories/${categoryId}`);
    return response.data;
  },
};

export default api;
