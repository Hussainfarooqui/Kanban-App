const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  console.log('Connecting to database and checking user:', email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found:', email);
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log('Found user id:', user.id);
  console.log('Stored password hash (first 200 chars):', (user.password || '').toString().slice(0,200));

  const plain = 'password123';
  const match = await bcrypt.compare(plain, user.password);
  console.log('bcrypt.compare with "password123":', match);

  if (!match) {
    console.log('Updating user password to hashed "password123" for development...');
    const hashed = await bcrypt.hash(plain, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    console.log('Password updated.');
  } else {
    console.log('Password matches; no update needed.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
