import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import CustomerMenu from "@/components/CustomerMenu";

const prisma = new PrismaClient();

interface PageProps {
  params: {
    tableId: string;
  };
}

export default async function OrderPage({ params }: PageProps) {
  // Wait for params as per Next.js 15
  const tableId = (await params).tableId;

  // Validate the table
  const table = await prisma.table.findFirst({
    where: { tableNumber: tableId }
  });

  if (!table) {
    notFound();
  }

  // Fetch menu
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { isAvailable: true }
      }
    }
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-red-500/30">
      <CustomerMenu tableId={table.id} tableNumber={table.tableNumber} categories={categories} />
    </main>
  );
}
