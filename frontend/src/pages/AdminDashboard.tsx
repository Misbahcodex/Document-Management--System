import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Category, User } from '../types';
import { categoriesAPI, accessAPI } from '../utils/api';
import { 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Settings,
  FolderOpen,
  BarChart3
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResponse, usersResponse] = await Promise.all([
        categoriesAPI.getAll(),
        accessAPI.getAllUsers()
      ]);
      setCategories(categoriesResponse.categories);
      setUsers(usersResponse.users);
    } catch (error: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await categoriesAPI.create({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      });
      setShowNewCategory(false);
      loadData();
    } catch (error: any) {
      setError('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesAPI.delete(categoryId);
      loadData();
    } catch (error: any) {
      setError('Failed to delete category');
    }
  };

  const handleGrantAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryId = selectedCategory?.id || (formData.get('categoryId') as string);
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    try {
      await accessAPI.grantAccess({
        categoryId,
        userId: formData.get('userId') as string,
        accessType: formData.get('accessType') as 'full' | 'read-only',
      });
      setShowAccessControl(false);
      setSelectedCategory(null);
      loadData();
      setError('');
    } catch (error: any) {
      setError('Failed to grant access: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Document Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Folders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.folders?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Access</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.accessControls?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Categories Management</h2>
              <button
                onClick={() => setShowNewCategory(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowAccessControl(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Manage Access"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{category.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{category.folders?.length || 0} folders</span>
                    <span>{category.accessControls?.length || 0} users have access</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Users Management</h2>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.accessControls?.length || 0} categories accessible
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.accessControls?.map((access: any) => (
                      <div key={access.id} className="flex items-center gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {access.category.name} ({access.accessType})
                        </span>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Remove access to ${access.category.name}?`)) {
                              try {
                                await accessAPI.revokeAccess({
                                  categoryId: access.category.id,
                                  userId: user.id
                                });
                                loadData();
                              } catch (error: any) {
                                setError('Failed to revoke access');
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Remove Access"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setShowAccessControl(true);
                      }}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                    >
                      + Add Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Category Modal */}
      {showNewCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  name="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Control Modal */}
      {showAccessControl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {selectedCategory ? `Grant Access to "${selectedCategory.name}"` : 'Grant Category Access'}
            </h3>
            <form onSubmit={handleGrantAccess} className="space-y-4">
              {!selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Category</label>
                  <select
                    name="categoryId"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Choose a category...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Select User</label>
                <select
                  name="userId"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Type</label>
                <select
                  name="accessType"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="full">Full Access</option>
                  <option value="read-only">Read Only</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccessControl(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
