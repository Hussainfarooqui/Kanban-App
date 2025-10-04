const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    console.log('user:', JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();