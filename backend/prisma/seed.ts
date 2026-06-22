import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Legacy food-ordering product seed removed (T-001).
  // Geo and business seeds are added in T-022 / T-052.
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
