import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Master Admin into MongoDB...');
  
  // Create or enforce the Admin User
  const admin = await prisma.dashboardUser.upsert({
    where: { email: 'abwcurious.pvtltd@gmail.com' },
    update: {
      password: 'ABWcurious@20#26',
      role: 'admin'
    },
    create: {
      name: 'ABW Administrator',
      email: 'abwcurious.pvtltd@gmail.com',
      password: 'ABWcurious@20#26',
      designation: 'Master Node',
      role: 'admin',
      contact: 'Admin Secure Line',
      age: '0'
    }
  });

  console.log('Admin user successfully injected into MongoDB Atlas Grid:');
  console.log(admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
