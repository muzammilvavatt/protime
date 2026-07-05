import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial admin account...');

  // Simple password hash (we will implement bcrypt later, this is just a placeholder for the seed)
  // For production, always use bcrypt/argon2!
  // Right now, let's just insert a plain string since we don't have bcrypt installed yet,
  // we will install it shortly. Let's use a dummy hash.
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@consultancy.com' },
    update: {},
    create: {
      email: 'admin@consultancy.com',
      name: 'System Admin',
      passwordHash: 'admin123', // In real app, this MUST be hashed
      role: 'ADMIN',
    },
  });

  console.log('Admin account created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
