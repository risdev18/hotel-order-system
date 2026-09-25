const fs = require('fs');
const path = require('path');

// 1. Refactor API routes
const apiDir = path.join(__dirname, 'src/app/api');
const apiFiles = [
  'admin/orders/route.ts',
  'admin/orders/pay/route.ts',
  'admin/settings/route.ts',
  'menu/route.ts',
  'tables/route.ts',
  'tables/qr/route.ts',
  'admin/menu/upload/route.ts',
  'orders/route.ts'
];

apiFiles.forEach(file => {
  const filePath = path.join(apiDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Inject restaurantId extraction
  if (content.includes('export async function GET(req: NextRequest)') || content.includes('export async function GET()')) {
     content = content.replace(/export async function GET\((.*?)\) \{/, 'export async function GET(req: NextRequest) {\n  const restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl.searchParams.get("restaurantId");\n  if (!restaurantId) return NextResponse.json({error: "Missing restaurantId"}, {status:400});\n');
  }
  
  if (content.includes('export async function POST(req: NextRequest)')) {
     content = content.replace(/export async function POST\(req: NextRequest\) \{/, 'export async function POST(req: NextRequest) {\n  let restaurantId = req.headers.get("x-restaurant-id") || req.nextUrl?.searchParams?.get("restaurantId");\n  // Also allow body to have restaurantId\n');
  }
  
  if (content.includes('export async function PUT(req: NextRequest)')) {
     content = content.replace(/export async function PUT\(req: NextRequest\) \{/, 'export async function PUT(req: NextRequest) {\n  let restaurantId = req.headers.get("x-restaurant-id");\n');
  }

  // Update prisma calls to include restaurantId
  content = content.replace(/prisma\.order\.findMany\(\{\n\s*where: \{/g, 'prisma.order.findMany({\n      where: {\n        restaurantId,');
  content = content.replace(/prisma\.table\.findMany\(\{\n\s*orderBy/g, 'prisma.table.findMany({\n      where: { restaurantId },\n      orderBy');
  content = content.replace(/prisma\.menuCategory\.findMany\(\{\n\s*include/g, 'prisma.menuCategory.findMany({\n      where: { restaurantId },\n      include');
  content = content.replace(/prisma\.restaurant\.update\(/g, 'prisma.restaurant.update({\n      where: { id: restaurantId },\n'); // for settings
  
  // We need specific fixes for some routes
  if (file === 'admin/settings/route.ts') {
      content = content.replace(/prisma\.storeSettings\.findFirst\(\)/, 'prisma.restaurant.findUnique({ where: { id: restaurantId } })');
      content = content.replace(/prisma\.storeSettings\.findFirst/, 'prisma.restaurant.findUnique');
      content = content.replace(/prisma\.storeSettings\.update/, 'prisma.restaurant.update');
      content = content.replace(/id: settings\.id/, 'id: restaurantId');
      content = content.replace(/settings: settings/, 'settings: restaurant');
  }
  
  fs.writeFileSync(filePath, content);
});

// 2. Refactor Admin Page
const adminPagePath = path.join(__dirname, 'src/app/admin/page.tsx');
let adminContent = fs.readFileSync(adminPagePath, 'utf8');

// Replace login state
adminContent = adminContent.replace(
  /const \[passwordInput, setPasswordInput\] = useState\(""\);/,
  `const [slugInput, setSlugInput] = useState("");\n  const [passwordInput, setPasswordInput] = useState("");\n  const [restaurantId, setRestaurantId] = useState("");`
);

// Replace handleLogin
adminContent = adminContent.replace(
  /const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\};/,
  `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok) {
        setRestaurantId(data.restaurantId);
        setIsAuthenticated(true);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Login failed");
    }
  };`
);

// Replace login form inputs
adminContent = adminContent.replace(
  /<input \n\s*type="password"[\s\S]*?autoFocus\n\s*\/>/,
  `<input 
            type="text" 
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="Restaurant URL (e.g. sagar-ratna)"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors mb-4"
            autoFocus
          />
          <input 
            type="password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin Password..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors mb-4"
          />`
);

// Replace Tab Rendering
adminContent = adminContent.replace(
  /<main className="flex-1 overflow-y-auto print:overflow-visible">[\s\S]*?<\/main>/,
  `<main className="flex-1 overflow-y-auto print:overflow-visible">
        {activeTab === "orders" && <LiveOrdersTab restaurantId={restaurantId} />}
        {activeTab === "menu" && <MenuManagementTab restaurantId={restaurantId} />}
        {activeTab === "tables" && <TablesManagementTab restaurantId={restaurantId} />}
        {activeTab === "billing" && <BillingTab restaurantId={restaurantId} />}
        {activeTab === "settings" && <SettingsTab restaurantId={restaurantId} />}
      </main>`
);

// Add restaurantId prop to all functions
adminContent = adminContent.replace(/function LiveOrdersTab\(\) \{/g, 'function LiveOrdersTab({ restaurantId }: { restaurantId: string }) {');
adminContent = adminContent.replace(/function MenuManagementTab\(\) \{/g, 'function MenuManagementTab({ restaurantId }: { restaurantId: string }) {');
adminContent = adminContent.replace(/function TablesManagementTab\(\) \{/g, 'function TablesManagementTab({ restaurantId }: { restaurantId: string }) {');
adminContent = adminContent.replace(/function BillingTab\(\) \{/g, 'function BillingTab({ restaurantId }: { restaurantId: string }) {');
adminContent = adminContent.replace(/function SettingsTab\(\) \{/g, 'function SettingsTab({ restaurantId }: { restaurantId: string }) {');

// Add headers to all fetch calls in admin page
adminContent = adminContent.replace(/fetch\("([^"]+)"\)/g, 'fetch("$1", { headers: { "x-restaurant-id": restaurantId } })');
adminContent = adminContent.replace(/fetch\("([^"]+)",\s*\{/g, 'fetch("$1", {\n        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },');
// Remove duplicated content-type if any
adminContent = adminContent.replace(/"Content-Type": "application\/json",\s*"Content-Type": "application\/json"/g, '"Content-Type": "application/json"');

fs.writeFileSync(adminPagePath, adminContent);

console.log("Refactor complete.");
