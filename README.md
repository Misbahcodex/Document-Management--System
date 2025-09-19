# Document Management System

A comprehensive full-stack document management system built with **React**, **Node.js**, **Express**, **MySQL**, and **Cloudinary**.

## 🌟 Features

### System Admin Features
- **Category Management**: Create and manage document categories
- **Folder & Document Management**: Organize documents in hierarchical structure
- **User Access Control**: Grant/revoke category access permissions
- **Document Version Control**: Manage document versions and track changes
- **User Management**: View and manage system users

### User Features
- **Personal Library**: Access assigned categories and create personal folders
- **Document Upload**: Upload documents to Cloudinary with version tracking
- **Document Management**: View, download, and manage documents
- **Version History**: Track and access document versions
- **Role-based Access**: Access only permitted categories and documents

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: System Admin vs User permissions
- **File Upload**: Cloudinary integration for document storage
- **Document Versioning**: Complete version history tracking
- **Responsive UI**: Mobile-friendly interface with TailwindCSS
- **MySQL Database**: Robust data persistence with Prisma ORM

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with Prisma ORM
- **JWT** for authentication
- **Cloudinary** for file storage
- **Multer** for file upload handling
- **bcrypt** for password hashing

### Frontend
- **React** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **Lucide React** for icons
- **Headless UI** for components

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**
- **Cloudinary account** (free tier available)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd document-management-system
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/document_management_system"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Server
PORT=5000
NODE_ENV=development
```

#### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

#### Start Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend Application
```bash
npm start
```

The frontend application will start on `http://localhost:3000`

## 📊 Database Schema

The system uses the following main entities:

### Tables
- **system_admins**: System administrator accounts
- **users**: Regular user accounts
- **categories**: Document categories
- **folders**: Document folders within categories
- **documents**: Document metadata and file references
- **document_versions**: Document version history
- **access_controls**: User permissions for categories

### Key Relationships
- Categories → Folders (1:many)
- Folders → Documents (1:many)
- Documents → Versions (1:many)
- Categories → Access Controls (1:many)
- Users → Access Controls (1:many)

## 🔐 Authentication & Authorization

### User Types
1. **System Admin** (`system_admin`): Full system access
2. **User** (`user`): Limited access based on permissions

### Access Control
- Users can only access categories they've been granted permission to
- Two permission types: `full` and `read-only`
- Role-based route protection in frontend
- JWT token-based session management

## 🎯 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /admin/register` - Register system admin
- `POST /admin/login` - Admin login
- `POST /user/register` - Register user
- `POST /user/login` - User login
- `GET /me` - Get current user info

### Categories (`/api/categories`)
- `GET /` - List all categories
- `GET /:id` - Get category details
- `POST /` - Create category (admin only)
- `PUT /:id` - Update category (admin only)
- `DELETE /:id` - Delete category (admin only)

### Folders (`/api/folders`)
- `POST /` - Create folder
- `GET /category/:categoryId` - Get folders by category
- `GET /:id` - Get folder details
- `PUT /:id` - Update folder
- `DELETE /:id` - Delete folder

### Documents (`/api/documents`)
- `POST /` - Upload document
- `GET /folder/:folderId` - Get documents by folder
- `GET /:id` - Get document details
- `PUT /:id` - Update document metadata
- `POST /:id/versions` - Create new version
- `GET /:id/versions` - Get version history
- `DELETE /:id` - Delete document

### Access Control (`/api/access`)
- `POST /grant` - Grant user access (admin only)
- `POST /revoke` - Revoke user access (admin only)
- `GET /users` - List all users (admin only)
- `GET /users/:userId` - Get user permissions
- `GET /categories/:categoryId` - Get category permissions

## 🧪 Sample Data

After running the seed script, you'll have:

### Test Accounts
- **Admin**: `admin@example.com` / `admin123`
- **Users**: 
  - `john@example.com` / `user123` (HR & Marketing access)
  - `jane@example.com` / `user123` (HR read-only & Finance full)
  - `bob@example.com` / `user123` (IT & Technology access)

### Sample Structure
- 4 Categories: HR, Finance, Marketing, IT & Technology
- 8 Folders with realistic structure
- 6 Sample documents with version history
- Configured access permissions

## 🎨 Frontend Components

### Page Structure
```
src/
├── pages/
│   ├── Login.tsx           # Authentication page
│   ├── Register.tsx        # User registration
│   ├── Dashboard.tsx       # User dashboard
│   └── AdminDashboard.tsx  # Admin dashboard
├── components/
│   ├── layout/             # Layout components
│   ├── forms/              # Form components
│   ├── documents/          # Document-related components
│   └── ui/                 # Reusable UI components
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── utils/
│   └── api.ts              # API service layer
└── types/
    └── index.ts            # TypeScript definitions
```

### Key Features
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Role-based Routing**: Protected routes based on user role
- **Document Upload**: Drag-and-drop file upload interface
- **Version Management**: Visual version history and comparison
- **Real-time Updates**: Optimistic UI updates

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run db:migrate   # Run new migrations
npm run db:seed      # Reseed database
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test            # Run tests
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev --name description
```

## 📦 Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations
3. Build and deploy to your hosting platform
4. Configure Cloudinary for production

### Frontend Deployment
1. Update `REACT_APP_API_URL` for production
2. Build the application: `npm run build`
3. Deploy to static hosting (Netlify, Vercel, etc.)

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **File Type Validation**: Restricted file uploads
- **SQL Injection Prevention**: Prisma ORM protection
- **CORS Configuration**: Proper cross-origin setup

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@example.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- **Prisma** for excellent database tooling
- **Cloudinary** for reliable file storage
- **TailwindCSS** for beautiful, responsive design
- **React** and **Node.js** communities for excellent documentation

---

**Happy Coding!** 🚀
