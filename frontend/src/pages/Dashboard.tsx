import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Category, Folder, Document } from '../types';
import { categoriesAPI, foldersAPI, documentsAPI } from '../utils/api';
import { 
  LogOut, 
  Folder as FolderIcon, 
  FileText, 
  Upload, 
  Plus,
  Download,
  Eye,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [documentVersions, setDocumentVersions] = useState<any[]>([]);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.categories);
    } catch (error: any) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async (categoryId: string) => {
    try {
      const response = await foldersAPI.getByCategory(categoryId);
      setFolders(response.folders);
    } catch (error: any) {
      setError('Failed to load folders');
    }
  };

  const loadDocuments = async (folderId: string) => {
    try {
      const response = await documentsAPI.getByFolder(folderId);
      setDocuments(response.documents);
    } catch (error: any) {
      setError('Failed to load documents');
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedFolder(null);
    setDocuments([]);
    loadFolders(category.id);
  };

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    loadDocuments(folder.id);
  };

  const handleCreateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const formData = new FormData(e.currentTarget);
    try {
      await foldersAPI.create({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        categoryId: selectedCategory.id,
      });
      setShowNewFolder(false);
      loadFolders(selectedCategory.id);
    } catch (error: any) {
      setError('Failed to create folder');
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    return allowedTypes.includes(file.type) && allowedExtensions.includes(fileExtension);
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile || !selectedFolder) return;

    // Validate file type
    if (!validateFile(uploadFile)) {
      setError('Invalid file type. Only Word (.doc, .docx) and PDF files are allowed.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    try {
      await documentsAPI.create({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        folderId: selectedFolder.id,
        file: uploadFile,
      });
      setShowUpload(false);
      setUploadFile(null);
      loadDocuments(selectedFolder.id);
      setError('');
    } catch (error: any) {
      setError('Failed to upload document: ' + (error.response?.data?.error || error.message));
    }
  };

  const loadVersions = async (documentId: string) => {
    try {
      const response = await documentsAPI.getVersions(documentId);
      setDocumentVersions(response.versions);
    } catch (error: any) {
      setError('Failed to load versions');
    }
  };

  const handleShowVersions = (document: Document) => {
    setSelectedDocument(document);
    setShowVersions(true);
    loadVersions(document.id);
  };

  const handleCreateVersion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newVersionFile || !selectedDocument) return;

    // Validate file type
    if (!validateFile(newVersionFile)) {
      setError('Invalid file type. Only Word (.doc, .docx) and PDF files are allowed.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    try {
      await documentsAPI.createVersion(
        selectedDocument.id,
        newVersionFile,
        formData.get('changeLog') as string
      );
      setShowNewVersion(false);
      setNewVersionFile(null);
      loadVersions(selectedDocument.id);
      loadDocuments(selectedFolder!.id);
      setError('');
    } catch (error: any) {
      setError('Failed to create version: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedDocument) return;
    if (!window.confirm('Are you sure you want to restore this version? This will create a new version with the restored content.')) return;

    try {
      await documentsAPI.restoreVersion(selectedDocument.id, versionId);
      loadVersions(selectedDocument.id);
      loadDocuments(selectedFolder!.id);
      setError('');
    } catch (error: any) {
      setError('Failed to restore version: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleViewDocument = (url: string, fileType: string, title: string) => {
    // For PDFs, open directly in browser
    if (fileType === 'application/pdf' || url.includes('.pdf')) {
      window.open(url, '_blank');
      return;
    }
    
    // For Word documents, try to open in browser but warn user
    if (fileType.includes('word') || fileType.includes('document') || 
        url.includes('.doc') || url.includes('.docx')) {
      // Some browsers can't display Word docs, so we'll open the URL
      // but the user might need to download it instead
      window.open(url, '_blank');
      return;
    }
    
    // For other files, just open the URL
    window.open(url, '_blank');
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
            <h1 className="text-2xl font-bold text-gray-900">Document Management System</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Categories</h2>
              </div>
              <div className="p-4 space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory?.id === category.id
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {!selectedCategory ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FolderIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Category</h3>
                <p className="mt-2 text-gray-500">Choose a category from the sidebar to view folders and documents.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Category Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedCategory.name}</h2>
                      <p className="text-gray-600">{selectedCategory.description}</p>
                    </div>
                    <button
                      onClick={() => setShowNewFolder(true)}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Folder
                    </button>
                  </div>
                </div>

                {/* Folders Grid */}
                {folders.length > 0 && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-medium">Folders</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => handleFolderSelect(folder)}
                          className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                            selectedFolder?.id === folder.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <FolderIcon className="h-6 w-6 text-primary-600 mr-3" />
                            <div>
                              <div className="font-medium">{folder.name}</div>
                              <div className="text-sm text-gray-500">{folder.description}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {folder.documents?.length || 0} documents
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedFolder && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="text-lg font-medium">Documents in {selectedFolder.name}</h3>
                      <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </button>
                    </div>
                    <div className="p-4">
                      {documents.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-gray-500">No documents in this folder</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {documents.map((document) => (
                            <div key={document.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FileText className="h-6 w-6 text-gray-400 mr-3" />
                                  <div>
                                    <div className="font-medium">{document.title}</div>
                                    <div className="text-sm text-gray-500">{document.description}</div>
                                    <div className="text-xs text-gray-400 flex items-center mt-1">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(document.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewDocument(document.cloudinaryUrl, document.fileType, document.title)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const link = window.document.createElement('a');
                                      link.href = document.cloudinaryUrl;
                                      link.download = document.title || 'document';
                                      link.target = '_blank';
                                      window.document.body.appendChild(link);
                                      link.click();
                                      window.document.body.removeChild(link);
                                    }}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleShowVersions(document)}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                                    title="Version History"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Folder Name</label>
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
                  onClick={() => setShowNewFolder(false)}
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

      {/* Upload Document Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Upload Document</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Title</label>
                <input
                  name="title"
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
              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && !validateFile(file)) {
                      setError('Invalid file type. Only Word (.doc, .docx) and PDF files are allowed.');
                      e.target.value = '';
                      return;
                    }
                    setUploadFile(file);
                    setError('');
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  accept=".pdf,.doc,.docx"
                />
                <p className="text-xs text-gray-500 mt-1">Only Word (.doc, .docx) and PDF files are allowed</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersions && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Version History - {selectedDocument.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNewVersion(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  New Version
                </button>
                <button
                  onClick={() => {
                    setShowVersions(false);
                    setSelectedDocument(null);
                    setDocumentVersions([]);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {documentVersions.map((version, index) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        Version {version.versionNumber} {index === 0 && '(Current)'}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Uploaded by {version.uploadedByAdmin?.name || version.uploadedByUser?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDocument(version.cloudinaryUrl, version.fileType, selectedDocument?.title || 'document')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const link = window.document.createElement('a');
                          link.href = version.cloudinaryUrl;
                          link.download = selectedDocument?.title || 'document';
                          link.target = '_blank';
                          window.document.body.appendChild(link);
                          link.click();
                          window.document.body.removeChild(link);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {index !== 0 && (
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                          title="Restore this version"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                  {version.changeLog && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Change Log:</strong> {version.changeLog}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showNewVersion && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Upload New Version - {selectedDocument.title}</h3>
            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Change Log</label>
                <textarea
                  name="changeLog"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Describe what changed in this version..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && !validateFile(file)) {
                      setError('Invalid file type. Only Word (.doc, .docx) and PDF files are allowed.');
                      e.target.value = '';
                      return;
                    }
                    setNewVersionFile(file);
                    setError('');
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  accept=".pdf,.doc,.docx"
                />
                <p className="text-xs text-gray-500 mt-1">Only Word (.doc, .docx) and PDF files are allowed</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewVersion(false);
                    setNewVersionFile(null);
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Upload Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
