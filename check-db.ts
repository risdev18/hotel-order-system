import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const restaurants = await prisma.restaurant.findMany();
  console.log("Restaurants in Neon DB:", restaurants);
}
main().catch(console.error).finally(() => prisma.$disconnect());
