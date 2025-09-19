# Document Management System - Backend

Node.js/Express backend for the Document Management System with MySQL database and Cloudinary integration.

## 🚀 Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Database**
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── categoryController.js
│   ├── folderController.js
│   ├── documentController.js
│   └── accessController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── upload.js
├── routes/              # API routes
│   ├── auth.js
│   ├── categories.js
│   ├── folders.js
│   ├── documents.js
│   └── access.js
├── config/              # Configuration files
│   ├── database.js
│   └── cloudinary.js
├── utils/               # Utility functions
│   └── jwt.js
├── prisma/              # Database schema & migrations
│   └── schema.prisma
├── scripts/             # Database seeding
│   └── seed.js
└── server.js           # Main application file
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/admin/register` - Register system admin
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/register` - Register user
- `POST /api/auth/user/login` - User login
- `GET /api/auth/me` - Get current user

### Categories (Admin Only)
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `GET /api/categories/:id` - Get category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders/category/:categoryId` - Get folders by category
- `GET /api/folders/:id` - Get folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents/folder/:folderId` - Get documents by folder
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document metadata
- `POST /api/documents/:id/versions` - Create new version
- `GET /api/documents/:id/versions` - Get version history
- `DELETE /api/documents/:id` - Delete document

### Access Control (Admin Only)
- `POST /api/access/grant` - Grant user access
- `POST /api/access/revoke` - Revoke user access
- `GET /api/access/users` - List all users
- `GET /api/access/users/:userId` - Get user permissions
- `GET /api/access/categories/:categoryId` - Get category permissions

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (system_admin vs user)
- Protected routes with middleware
- Token validation and refresh

## 📊 Database Models

### SystemAdmin
- id, name, email, password
- Relations: categories, folders, documents, documentVersions

### User
- id, name, email, password
- Relations: accessControls, folders, documents, documentVersions

### Category
- id, name, description, createdByAdminId
- Relations: folders, accessControls, createdByAdmin

### Folder
- id, name, description, categoryId, ownerType
- Relations: category, documents, createdByAdmin, createdByUser

### Document
- id, title, description, cloudinaryUrl, fileType, fileSize, folderId, ownerType
- Relations: folder, versions, uploadedByAdmin, uploadedByUser

### DocumentVersion
- id, versionNumber, cloudinaryUrl, fileType, fileSize, changeLog, documentId
- Relations: document, uploadedByAdmin, uploadedByUser

### AccessControl
- id, accessType, categoryId, userId
- Relations: category, user

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/document_management_system"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=5000
NODE_ENV=development
```

## 🧪 Testing

Test credentials after running seed:
- **Admin**: admin@example.com / admin123
- **Users**: john@example.com, jane@example.com, bob@example.com / user123

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token validation
- Role-based route protection
- File type validation
- SQL injection prevention (Prisma)
- CORS configuration

## 📦 Dependencies

### Production
- express - Web framework
- prisma - Database ORM
- mysql2 - MySQL driver
- bcryptjs - Password hashing
- jsonwebtoken - JWT handling
- multer - File upload
- cloudinary - File storage
- cors - Cross-origin requests
- dotenv - Environment variables

### Development
- nodemon - Development server
- prisma CLI - Database management
