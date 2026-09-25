import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import CustomerMenu from "@/components/CustomerMenu";

const prisma = new PrismaClient();

interface PageProps {
  params: {
    slug: string;
    tableId: string;
  };
}

export default async function OrderPage({ params }: PageProps) {
  const slug = (await params).slug;
  const tableId = (await params).tableId;

  // Find the restaurant
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug }
  });

  if (!restaurant) {
    notFound();
  }

  // Find the specific table for this restaurant
  const table = await prisma.table.findUnique({
    where: {
      restaurantId_tableNumber: {
        restaurantId: restaurant.id,
        tableNumber: tableId
      }
    }
  });

  if (!table) {
    notFound();
  }

  // Fetch menu just for this restaurant
  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { isAvailable: true }
      }
    }
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-red-500/30">
      <CustomerMenu tableId={table.id} tableNumber={table.tableNumber} categories={categories} restaurantName={restaurant.name} restaurantLogo={restaurant.logoUrl} />
    </main>
  );
}
