# Document Management System - Frontend

React TypeScript frontend with TailwindCSS for the Document Management System.

## 🚀 Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

3. **Start Development Server**
```bash
npm start
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── forms/          # Form components
│   ├── documents/      # Document-related components
│   └── ui/             # Basic UI components
├── pages/              # Page components
│   ├── Login.tsx       # Authentication page
│   ├── Register.tsx    # User registration
│   ├── Dashboard.tsx   # User dashboard
│   └── AdminDashboard.tsx # Admin dashboard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── api.ts          # API service layer
└── App.tsx            # Main application component
```

## 🎨 Styling

- **TailwindCSS** - Utility-first CSS framework
- **Custom Color Palette** - Primary blue theme
- **Responsive Design** - Mobile-first approach
- **Component Library** - Headless UI for accessible components

## 🔐 Authentication

### Auth Context
Provides authentication state and methods throughout the app:
- `user` - Current user object
- `loading` - Loading state
- `login(credentials, userType)` - Login method
- `register(data, userType)` - Registration method
- `logout()` - Logout method
- `isAuthenticated` - Boolean authentication status
- `isAdmin` - Boolean admin status

### Protected Routes
Routes are protected based on user role and authentication status.

## 📱 Pages & Components

### Authentication Pages
- **Login** - Supports both admin and user login with role toggle
- **Register** - User registration form

### Dashboard Pages
- **User Dashboard** - Category browsing, folder management, document upload
- **Admin Dashboard** - Full system management interface

### Key Components

#### Layout Components
- **Header** - Navigation with user menu
- **Sidebar** - Category navigation
- **Layout** - Main layout wrapper

#### Form Components
- **CategoryForm** - Create/edit categories
- **FolderForm** - Create/edit folders
- **DocumentUpload** - File upload with progress
- **AccessControlForm** - Manage user permissions

#### Document Components
- **DocumentList** - Grid view of documents
- **DocumentCard** - Individual document preview
- **VersionHistory** - Document version timeline
- **DocumentViewer** - Preview documents

## 🌐 API Integration

### API Service Layer (`utils/api.ts`)
Centralized API calls with:
- Axios instance with interceptors
- Automatic token handling
- Error handling and redirects
- TypeScript interfaces

### API Modules
- `authAPI` - Authentication endpoints
- `categoriesAPI` - Category management
- `foldersAPI` - Folder operations
- `documentsAPI` - Document CRUD and versioning
- `accessAPI` - Access control management

## 🔧 Available Scripts

- `npm start` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📦 Key Dependencies

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router DOM** - Routing

### Styling
- **TailwindCSS** - Utility CSS framework
- **Headless UI** - Accessible components
- **Lucide React** - Icon library

### HTTP & State
- **Axios** - HTTP client
- **React Context** - State management

## 🎯 Features

### User Interface
- ✅ Responsive design
- ✅ Dark/light mode support
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ File upload progress
- ✅ Drag and drop uploads

### User Experience
- ✅ Role-based dashboards
- ✅ Breadcrumb navigation
- ✅ Search and filtering
- ✅ Document preview
- ✅ Version comparison
- ✅ Access control visualization

### Technical
- ✅ TypeScript for type safety
- ✅ Context for state management
- ✅ Protected routes
- ✅ Error boundaries
- ✅ Optimistic updates
- ✅ Token refresh handling

## 🛡️ Security

- JWT token storage in localStorage
- Automatic token validation
- Protected route components
- Role-based component rendering
- Secure file upload handling
## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
