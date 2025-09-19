export interface User {
  id: string;
  name: string;
  email: string;
  role: 'system_admin' | 'user';
  createdAt: string;
  updatedAt: string;
  accessControls?: AccessControl[];
}

export interface SystemAdmin extends User {
  role: 'system_admin';
}

export interface RegularUser extends User {
  role: 'user';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  createdByAdmin?: {
    name: string;
    email: string;
  };
  folders?: Folder[];
  accessControls?: AccessControl[];
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  ownerType: 'system_admin' | 'user';
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  createdByAdmin?: {
    name: string;
    email: string;
  };
  createdByUser?: {
    name: string;
    email: string;
  };
  documents?: Document[];
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  cloudinaryUrl: string;
  fileType: string;
  fileSize?: number;
  ownerType: 'system_admin' | 'user';
  folderId: string;
  createdAt: string;
  updatedAt: string;
  folder?: {
    name: string;
    category?: {
      name: string;
    };
  };
  uploadedByAdmin?: {
    name: string;
    email: string;
  };
  uploadedByUser?: {
    name: string;
    email: string;
  };
  versions?: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  cloudinaryUrl: string;
  fileType: string;
  fileSize?: number;
  changeLog?: string;
  documentId: string;
  createdAt: string;
  uploadedByAdmin?: {
    name: string;
    email: string;
  };
  uploadedByUser?: {
    name: string;
    email: string;
  };
}

export interface AccessControl {
  id: string;
  accessType: 'full' | 'read-only';
  categoryId: string;
  userId: string;
  grantedAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  admin?: SystemAdmin;
  user?: RegularUser;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface CreateFolderData {
  name: string;
  description?: string;
  categoryId: string;
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  folderId: string;
  file: File;
}

export interface GrantAccessData {
  categoryId: string;
  userId: string;
  accessType: 'full' | 'read-only';
}

export interface RevokeAccessData {
  categoryId: string;
  userId: string;
}
