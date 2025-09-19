require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await prisma.documentVersion.deleteMany();
    await prisma.document.deleteMany();
    await prisma.folder.deleteMany();
    await prisma.accessControl.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemAdmin.deleteMany();

    // Create System Admin
    console.log('👤 Creating System Admin...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.systemAdmin.create({
      data: {
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedAdminPassword,
      },
    });
    console.log(`✅ Created admin: ${admin.email}`);

    // Create test users
    console.log('👥 Creating test users...');
    const hashedUserPassword = await bcrypt.hash('user123', 12);
    
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedUserPassword,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedUserPassword,
      },
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: hashedUserPassword,
      },
    });

    console.log(`✅ Created users: ${user1.email}, ${user2.email}, ${user3.email}`);

    // Create categories
    console.log('📁 Creating categories...');
    const category1 = await prisma.category.create({
      data: {
        name: 'Human Resources',
        description: 'HR policies, procedures, and employee documentation',
        createdByAdminId: admin.id,
      },
    });

    const category2 = await prisma.category.create({
      data: {
        name: 'Finance',
        description: 'Financial reports, budgets, and accounting documents',
        createdByAdminId: admin.id,
      },
    });

    const category3 = await prisma.category.create({
      data: {
        name: 'Marketing',
        description: 'Marketing materials, campaigns, and brand guidelines',
        createdByAdminId: admin.id,
      },
    });

    const category4 = await prisma.category.create({
      data: {
        name: 'IT & Technology',
        description: 'Technical documentation, system guides, and IT policies',
        createdByAdminId: admin.id,
      },
    });

    console.log(`✅ Created categories: ${category1.name}, ${category2.name}, ${category3.name}, ${category4.name}`);

    // Create access controls
    console.log('🔐 Creating access controls...');
    
    // Give John full access to HR and Marketing
    await prisma.accessControl.create({
      data: {
        categoryId: category1.id,
        userId: user1.id,
        accessType: 'full',
      },
    });

    await prisma.accessControl.create({
      data: {
        categoryId: category3.id,
        userId: user1.id,
        accessType: 'full',
      },
    });

    // Give Jane read-only access to HR and full access to Finance
    await prisma.accessControl.create({
      data: {
        categoryId: category1.id,
        userId: user2.id,
        accessType: 'read-only',
      },
    });

    await prisma.accessControl.create({
      data: {
        categoryId: category2.id,
        userId: user2.id,
        accessType: 'full',
      },
    });

    // Give Bob full access to IT & Technology
    await prisma.accessControl.create({
      data: {
        categoryId: category4.id,
        userId: user3.id,
        accessType: 'full',
      },
    });

    console.log('✅ Access controls created');

    // Create folders
    console.log('📂 Creating folders...');
    
    // HR folders
    const hrPolicies = await prisma.folder.create({
      data: {
        name: 'Company Policies',
        description: 'Official company policies and procedures',
        categoryId: category1.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    const hrHandbooks = await prisma.folder.create({
      data: {
        name: 'Employee Handbooks',
        description: 'Employee handbooks and onboarding materials',
        categoryId: category1.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    // Finance folders
    const financeReports = await prisma.folder.create({
      data: {
        name: 'Monthly Reports',
        description: 'Monthly financial reports and statements',
        categoryId: category2.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    const budgets = await prisma.folder.create({
      data: {
        name: 'Budget Planning',
        description: 'Annual and quarterly budget documents',
        categoryId: category2.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    // Marketing folders
    const brandGuidelines = await prisma.folder.create({
      data: {
        name: 'Brand Guidelines',
        description: 'Logo usage, color schemes, and brand standards',
        categoryId: category3.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    const campaigns = await prisma.folder.create({
      data: {
        name: 'Marketing Campaigns',
        description: 'Campaign materials and performance reports',
        categoryId: category3.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    // IT folders
    const itPolicies = await prisma.folder.create({
      data: {
        name: 'IT Policies',
        description: 'Information technology policies and procedures',
        categoryId: category4.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    const userGuides = await prisma.folder.create({
      data: {
        name: 'User Guides',
        description: 'Software and system user documentation',
        categoryId: category4.id,
        ownerType: 'system_admin',
        createdByAdminId: admin.id,
      },
    });

    console.log('✅ Folders created');

    // Note: Documents would normally be created with actual file uploads
    // For seed data, we'll create placeholder document entries
    console.log('📄 Creating sample documents...');
    
    const sampleDocs = [
      {
        title: 'Employee Code of Conduct',
        description: 'Official code of conduct for all employees',
        cloudinaryUrl: 'https://via.placeholder.com/300x400.pdf?text=Employee+Code+of+Conduct',
        fileType: 'application/pdf',
        fileSize: 2547892,
        folderId: hrPolicies.id,
        ownerType: 'system_admin',
        uploadedByAdminId: admin.id,
      },
      {
        title: 'Remote Work Policy',
        description: 'Guidelines for remote work arrangements',
        cloudinaryUrl: 'https://via.placeholder.com/300x400.pdf?text=Remote+Work+Policy',
        fileType: 'application/pdf',
        fileSize: 1894736,
        folderId: hrPolicies.id,
        ownerType: 'system_admin',
        uploadedByAdminId: admin.id,
      },
      {
        title: 'New Employee Handbook',
        description: 'Comprehensive guide for new hires',
        cloudinaryUrl: 'https://via.placeholder.com/300x400.pdf?text=Employee+Handbook',
        fileType: 'application/pdf',
        fileSize: 5231847,
        folderId: hrHandbooks.id,
        ownerType: 'system_admin',
        uploadedByAdminId: admin.id,
      },
      {
        title: 'Q1 Financial Report',
        description: 'First quarter financial performance report',
        cloudinaryUrl: 'https://via.placeholder.com/300x400.pdf?text=Q1+Report',
        fileType: 'application/pdf',
        fileSize: 3547291,
        folderId: financeReports.id,
        ownerType: 'system_admin',
        uploadedByAdminId: admin.id,
      },
      {
        title: '2024 Marketing Budget',
        description: 'Annual marketing budget and allocation',
        cloudinaryUrl: 'https://via.placeholder.com/300x400.xlsx?text=Marketing+Budget',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 892746,
        folderId: budgets.id,
        ownerType: 'system_admin',
        uploadedByAdminId: admin.id,
      },
      {
        title: 'Brand Style Guide',
        description: 'Complete brand identity and usage guidelines',
        cloudinaryUrl: 'https://via.placeholder.com/300x400.pdf?text=Style+Guide',
        fileType: 'application/pdf',
        fileSize: 7834629,
        folderId: brandGuidelines.id,
        ownerType: 'system_admin',
        uploadedByAdminId: admin.id,
      },
    ];

    for (const docData of sampleDocs) {
      const document = await prisma.document.create({
        data: docData,
      });

      // Create initial version
      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          versionNumber: 1,
          cloudinaryUrl: docData.cloudinaryUrl,
          fileType: docData.fileType,
          fileSize: docData.fileSize,
          changeLog: 'Initial version',
          uploadedByAdminId: admin.id,
        },
      });
    }

    console.log('✅ Sample documents created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - 1 System Admin: admin@example.com (password: admin123)`);
    console.log(`   - 3 Users: john@example.com, jane@example.com, bob@example.com (password: user123)`);
    console.log(`   - 4 Categories: HR, Finance, Marketing, IT & Technology`);
    console.log(`   - 8 Folders with sample structure`);
    console.log(`   - 6 Sample documents with versions`);
    console.log(`   - Access controls configured for users`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
