import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'spice-grill' },
    update: {},
    create: {
      name: 'Spice Grill',
      slug: 'spice-grill',
      password: 'GanpatiBappaMorya',
      tableCount: 30
    }
  });

  const dhaba = await prisma.restaurant.upsert({
    where: { slug: 'the-royal-dhaba' },
    update: {},
    create: {
      name: 'The Royal Dhaba',
      slug: 'the-royal-dhaba',
      password: 'GanpatiBappaMorya',
      tableCount: 30
    }
  });

  console.log("Successfully created restaurants in Neon:", restaurant, dhaba);
}

main().catch(console.error).finally(() => prisma.$disconnect());
