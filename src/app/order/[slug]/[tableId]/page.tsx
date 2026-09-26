import { notFound } from "next/navigation";
import CustomerMenu from "@/components/CustomerMenu";
import { db } from "@/lib/firebase-admin";

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
  const restSnap = await db.collection("restaurants").where("slug", "==", slug).get();
  if (restSnap.empty) {
    notFound();
  }
  const restaurant = { id: restSnap.docs[0].id, ...restSnap.docs[0].data() } as any;

  // Find the specific table for this restaurant
  const tableSnap = await db.collection("tables")
    .where("restaurantId", "==", restaurant.id)
    .where("tableNumber", "==", tableId) // tableId in URL is now the table number (e.g. T130)
    .get();

  if (tableSnap.empty) {
    notFound();
  }
  const table = { id: tableSnap.docs[0].id, ...tableSnap.docs[0].data() } as any;

  // Fetch menu just for this restaurant
  const categoriesSnap = await db.collection("menuCategories").where("restaurantId", "==", restaurant.id).get();
  const itemsSnap = await db.collection("menuItems").where("restaurantId", "==", restaurant.id).where("isAvailable", "==", true).get();

  const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const categories = categoriesSnap.docs.map(doc => {
    const catData = doc.data();
    return {
      id: doc.id,
      name: catData.name,
      sortOrder: catData.sortOrder || 0,
      items: items.filter((item: any) => item.categoryId === doc.id)
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-red-500/30">
      <CustomerMenu tableId={table.id} tableNumber={table.tableNumber} categories={categories} restaurantName={restaurant.name} restaurantLogo={restaurant.logoUrl} restaurantId={restaurant.id} />
    </main>
  );
}
