"use client";

import { useEffect, useState } from "react";
import { 
  Clock, CheckCircle2, ChefHat, Check, Receipt, 
  Lock, Upload, Sparkles, Loader2, Printer, RefreshCw,
  LayoutDashboard, Utensils, Grid, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_PASSWORD = "admin"; // Simple password as requested

export default function UnifiedAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "tables" | "billing" | "settings">("orders");

  // Auth Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
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
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-neutral-900 p-8 rounded-3xl w-full max-w-sm border border-neutral-800 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-md flex items-center justify-center">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h2>
          <p className="text-neutral-500 text-center text-sm mb-6">Enter password to manage restaurant</p>
          
          <input 
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
          />
          <button 
            type="submit"
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row print:bg-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col print:hidden shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-orange-600">
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("orders")}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap", activeTab === "orders" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50")}
          >
            <LayoutDashboard size={20} /> Live Orders
          </button>
          <button 
            onClick={() => setActiveTab("menu")}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap", activeTab === "menu" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50")}
          >
            <Utensils size={20} /> Menu Settings
          </button>
          <button 
            onClick={() => setActiveTab("tables")}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap", activeTab === "tables" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50")}
          >
            <Grid size={20} /> Tables & QR
          </button>
          <button 
            onClick={() => setActiveTab("billing")}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap", activeTab === "billing" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50")}
          >
            <Receipt size={20} /> Billing & Checkout
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap", activeTab === "settings" ? "bg-orange-50 text-orange-600" : "text-neutral-600 hover:bg-neutral-50")}
          >
            <Settings size={20} /> Store Settings
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto print:overflow-visible">
        {activeTab === "orders" && <LiveOrdersTab restaurantId={restaurantId} />}
        {activeTab === "menu" && <MenuManagementTab restaurantId={restaurantId} />}
        {activeTab === "tables" && <TablesManagementTab restaurantId={restaurantId} />}
        {activeTab === "billing" && <BillingTab restaurantId={restaurantId} />}
        {activeTab === "settings" && <SettingsTab restaurantId={restaurantId} />}
      </main>
    </div>
  );
}

// ==========================================
// TAB 1: LIVE ORDERS
// ==========================================
function LiveOrdersTab({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ orderId, status }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-md animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-neutral-900">Live Orders</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => {
          const isPending = order.status === "placed";
          const isPreparing = order.status === "preparing";
          const isServed = order.status === "served";

          return (
            <div key={order.id} className={cn("bg-white rounded-2xl p-6 border-l-4 shadow-sm", 
              isPending ? "border-red-500" : isPreparing ? "border-orange-500" : "border-green-500"
            )}>
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-black text-neutral-900">{order.table.tableNumber}</h3>
                  <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                    <Clock size={14} /> 
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase",
                  isPending ? "bg-red-100 text-red-700" : isPreparing ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                )}>
                  {order.status}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg bg-neutral-100 px-2 rounded-md text-neutral-800">{item.quantity}x</span>
                      <span className="font-medium text-neutral-700">{item.menuItem.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {isPending && (
                  <button onClick={() => updateOrderStatus(order.id, "preparing")} className="flex-1 bg-neutral-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
                    <ChefHat size={18} /> Accept & Prepare
                  </button>
                )}
                {isPreparing && (
                  <button onClick={() => updateOrderStatus(order.id, "served")} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                    <CheckCircle2 size={18} /> Mark Served
                  </button>
                )}
                {isServed && order.paymentStatus === "unpaid" && (
                  <button onClick={() => alert("Billing module coming soon!")} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                    <Receipt size={18} /> Generate Bill
                  </button>
                )}
                {order.paymentStatus === "paid" && (
                   <button disabled className="flex-1 bg-neutral-100 text-neutral-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Check size={18} /> Paid & Closed
                 </button>
                )}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-neutral-400">
            <CheckCircle2 size={48} className="mb-4 opacity-50" />
            <p className="text-xl font-medium">No active orders</p>
            <p>Kitchen is clear. Waiting for new orders to arrive.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// TAB 2: MENU UPLOAD & MANAGEMENT
// ==========================================
function MenuManagementTab({ restaurantId }: { restaurantId: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState("");
  
  // Manual form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", categoryName: "", vegFlag: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk form state
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu", {
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
      });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ itemId, isAvailable: !currentStatus })
      });
      fetchMenu();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult("");

    const formData = new FormData();
    formData.append("menuImage", file);

    try {
      const res = await fetch("/api/admin/menu/upload", {
        headers: { "x-restaurant-id": restaurantId },
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setUploadResult(`Successfully added ${data.itemsInserted} items!`);
        fetchMenu();
      } else {
        setUploadResult(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setUploadResult(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadResult("");
    
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      
      if (res.ok) {
        setUploadResult(`Manually added "${newItem.name}" successfully!`);
        setNewItem({ name: "", price: "", categoryName: "", vegFlag: true }); // reset
        setShowManualForm(false);
        fetchMenu();
      } else {
        setUploadResult(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setUploadResult(`Failed to add item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    
    setIsBulkSubmitting(true);
    setUploadResult("");

    try {
      // Parse the text
      const lines = bulkText.split('\n');
      const items: any[] = [];
      let currentCategory = "General";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // If line doesn't have numbers, assume it's a category header
        if (!/\d/.test(trimmed)) {
          currentCategory = trimmed;
          continue;
        }

        // Try to match "Name - Price" or "Name Price"
        const match = trimmed.match(/^(.*?)[-:]?\s*(\d+(?:\.\d+)?)\s*$/);
        if (match) {
          items.push({
            name: match[1].trim(),
            price: parseFloat(match[2]),
            categoryName: currentCategory,
            vegFlag: true
          });
        }
      }

      const res = await fetch("/api/admin/menu/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      
      if (res.ok) {
        setUploadResult(`Successfully added ${data.itemsInserted} items!`);
        setBulkText("");
        setShowBulkForm(false);
        fetchMenu();
      } else {
        setUploadResult(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setUploadResult(`Failed to parse/add items: ${error.message}`);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult("Parsing CSV...");

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const items: any[] = [];

      // Assume CSV format: Category, Name, Price, IsVeg(true/false)
      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length >= 3) {
          items.push({
            categoryName: cols[0].trim(),
            name: cols[1].trim(),
            price: parseFloat(cols[2].trim()),
            vegFlag: cols[3] ? cols[3].trim().toLowerCase() === 'true' : true
          });
        }
      }

      const res = await fetch("/api/admin/menu/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      
      if (res.ok) {
        setUploadResult(`Successfully imported ${data.itemsInserted} items from CSV!`);
        fetchMenu();
      } else {
        setUploadResult(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setUploadResult(`CSV Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Menu Management</h1>
          <p className="text-neutral-500 mt-2">Manage your restaurant offerings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button 
            onClick={() => { setShowBulkForm(!showBulkForm); setShowManualForm(false); }}
            className="bg-white border border-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-medium hover:bg-neutral-50 transition-colors shadow-sm whitespace-nowrap h-full"
          >
            {showBulkForm ? "Cancel Bulk Add" : "+ Smart Paste"}
          </button>
          <button 
            onClick={() => { setShowManualForm(!showManualForm); setShowBulkForm(false); }}
            className="bg-white border border-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-medium hover:bg-neutral-50 transition-colors shadow-sm whitespace-nowrap h-full"
          >
            {showManualForm ? "Cancel Manual Add" : "+ Add 1 by 1"}
          </button>

          <div className="bg-orange-50 border border-orange-200 p-2 rounded-xl flex items-center gap-2">
            <label className="relative cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{isUploading ? "Uploading..." : "AI Photo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
            <label className="relative cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>CSV File</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>

      {uploadResult && (
        <div className={`p-4 mb-8 rounded-xl font-medium ${uploadResult.includes("Error") || uploadResult.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {uploadResult}
        </div>
      )}

      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-sm font-bold text-neutral-700 mb-1">Category</label>
            <input type="text" required placeholder="e.g. Starters" value={newItem.categoryName} onChange={e => setNewItem({...newItem, categoryName: e.target.value})} className="w-full bg-neutral-50 border rounded-xl px-4 py-2" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-bold text-neutral-700 mb-1">Item Name</label>
            <input type="text" required placeholder="e.g. Paneer Tikka" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-neutral-50 border rounded-xl px-4 py-2" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-bold text-neutral-700 mb-1">Price (₹)</label>
            <input type="number" required placeholder="250" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full bg-neutral-50 border rounded-xl px-4 py-2" />
          </div>
          <div className="lg:col-span-1 flex items-center h-[42px] px-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newItem.vegFlag} onChange={e => setNewItem({...newItem, vegFlag: e.target.checked})} className="w-5 h-5 accent-green-600" />
              <span className="font-bold text-neutral-700">Veg</span>
            </label>
          </div>
          <div className="lg:col-span-1">
            <button type="submit" disabled={isSubmitting} className="w-full bg-neutral-900 text-white font-bold py-2.5 rounded-xl hover:bg-neutral-800 h-[42px]">
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      )}

      {showBulkForm && (
        <form onSubmit={handleBulkSubmit} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm mb-8">
          <div className="mb-4">
            <label className="block text-sm font-bold text-neutral-700 mb-2">Smart Paste Area</label>
            <p className="text-sm text-neutral-500 mb-4">
              Paste your menu here. Write the category name on its own line, then list items with prices below it. <br/>
              <span className="font-mono bg-neutral-100 px-2 py-1 rounded text-xs">Example:<br/>Starters<br/>Paneer Tikka - 250<br/>Samosa 50<br/><br/>Mains<br/>Dal Makhani 180</span>
            </p>
            <textarea 
              rows={8}
              required 
              placeholder="Paste menu text here..." 
              value={bulkText} 
              onChange={e => setBulkText(e.target.value)} 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isBulkSubmitting} className="bg-neutral-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-neutral-800 flex items-center gap-2">
              {isBulkSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Process & Add Items
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {categories.length === 0 && !showManualForm && !showBulkForm && (
           <div className="py-12 text-center text-neutral-400 font-medium border-2 border-dashed rounded-2xl">
              No items on the menu yet. Upload a photo or add manually!
           </div>
        )}
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between border-b pb-2 text-neutral-900">
              {cat.name}
              <span className="text-sm font-normal text-neutral-500 bg-neutral-100 px-3 py-1 rounded-md">{cat.items.length} Items</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item: any) => (
                <div key={item.id} className={cn("border p-4 rounded-xl flex justify-between items-center group transition-colors", item.isAvailable ? "border-neutral-100 bg-neutral-50 hover:border-orange-200" : "border-red-200 bg-red-50 opacity-75")}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 ${item.vegFlag ? "border-green-500" : "border-red-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-md ${item.vegFlag ? "bg-green-500" : "bg-red-500"}`} />
                      </div>
                      <h4 className={cn("font-bold", item.isAvailable ? "text-neutral-800" : "text-neutral-500 line-through")}>{item.name}</h4>
                    </div>
                    <p className="text-orange-600 font-medium">₹{item.price}</p>
                  </div>
                  <button 
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={cn("px-3 py-1 text-xs font-bold rounded-md transition-colors", item.isAvailable ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200")}
                  >
                    {item.isAvailable ? "Mark Sold Out" : "Mark Available"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// TAB 3: TABLES & QR
// ==========================================
function TablesManagementTab({ restaurantId }: { restaurantId: string }) {
  const [tables, setTables] = useState<any[]>([]);
  const [settings, setSettings] = useState({ name: "The Royal Dhaba", logoUrl: "" });
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables", {
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
      });
      const data = await res.json();
      const sortedTables = (data.tables || []).sort((a: any, b: any) => {
        const numA = parseInt(a.tableNumber.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.tableNumber.replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
      });
      setTables(sortedTables);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTables();
    fetchSettings();
  }, []);

  const generateAllQRs = async () => {
    setIsGenerating(true);
    try {
      const promises = tables
        .filter(table => !table.qrCodeUrl)
        .map(table => 
          fetch("/api/tables/qr", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
            body: JSON.stringify({ tableId: table.id, hostUrl: window.location.origin })
          })
        );
      
      await Promise.all(promises);
      await fetchTables();
    } catch (error) {
      console.error(error);
      alert("Failed to generate some QR codes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTable = async () => {
    const tableNumber = prompt("Enter new table number (e.g. T11):");
    if (!tableNumber) return;
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ tableNumber })
      });
      if (res.ok) {
        fetchTables();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add table");
      }
    } catch (error) {
      alert("Error adding table");
    }
  };

  const handleBulkAddTables = async () => {
    const countStr = prompt("How many new tables do you want to bulk generate? (e.g. 50):");
    const count = parseInt(countStr || "0");
    if (!count || isNaN(count) || count <= 0) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/tables/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ count, hostUrl: window.location.origin })
      });
      if (res.ok) {
        fetchTables();
      } else {
        alert("Failed to bulk generate tables");
      }
    } catch (e) {
      alert("Error generating tables");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto print:p-0 print:max-w-none print:w-full">
      <div className="flex justify-between items-end mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Tables & QR Codes</h1>
          <p className="text-neutral-500 mt-2">Manage seating and print QR codes</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-end">
          <button 
            onClick={generateAllQRs}
            disabled={isGenerating}
            className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
            Generate Missing QRs
          </button>
          <button 
            onClick={handleAddTable}
            disabled={isGenerating}
            className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-neutral-50 transition-colors"
          >
            + Add 1 Table
          </button>
          <button 
            onClick={handleBulkAddTables}
            disabled={isGenerating}
            className="bg-orange-100 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-orange-200 transition-colors"
          >
            + Bulk Generate
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-neutral-900 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-md"
          >
            <Printer size={18} />
            Print QR Sheet
          </button>
        </div>
      </div>

      {tables.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400 bg-white rounded-3xl border border-neutral-200 shadow-sm print:hidden">
          <p className="text-xl font-medium mb-4">No tables found</p>
          <button onClick={handleBulkAddTables} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700">Auto-Generate Tables</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-8 print:w-full">
        {tables.map(table => (
          <div key={table.id} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col items-center justify-center print:border-2 print:border-black print:shadow-none break-inside-avoid">
            <h3 className="text-3xl font-black text-neutral-800 mb-1">{table.tableNumber}</h3>
            <p className="text-xs text-neutral-400 mb-4 print:text-black font-medium">Scan to Order</p>
            
            {table.qrCodeUrl ? (
              <img src={table.qrCodeUrl} alt={`QR for ${table.tableNumber}`} className="w-32 h-32 print:w-48 print:h-48" />
            ) : (
              <div className="w-32 h-32 bg-neutral-100 flex items-center justify-center rounded-xl text-neutral-400 text-sm print:hidden">
                No QR
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-200 w-full flex flex-col items-center justify-center print:border-black print:border-t-2">
              {settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="h-6 object-contain mb-1" />
              )}
              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500 print:text-black text-center">
                {settings.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// TAB 4: BILLING & CHECKOUT
// ==========================================
function BillingTab({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [settings, setSettings] = useState({ name: "The Royal Dhaba", logoUrl: "" });

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
      });
      const data = await res.json();
      // Only show orders that are ready for billing (e.g. not paid yet)
      setOrders(data.orders?.filter((o: any) => o.paymentStatus === 'unpaid') || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e) {}
  };

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, []);

  const handlePay = async (method: string) => {
    if (!selectedOrder) return;
    try {
      await fetch("/api/admin/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify({ orderId: selectedOrder.id, method })
      });
      alert("Payment recorded successfully!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      alert("Failed to process payment");
    }
  };

  const calculateSubtotal = (order: any) => {
    return order.items.reduce((total: number, item: any) => total + (item.quantity * item.priceAtOrderTime), 0);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* List of Unpaid Orders */}
      <div className="flex-1 space-y-4 print:hidden">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Pending Bills</h1>
        {orders.length === 0 && <p className="text-neutral-500">No pending bills.</p>}
        {orders.map(order => (
          <button 
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className={cn("w-full text-left bg-white rounded-2xl p-6 border-2 transition-all shadow-sm", 
              selectedOrder?.id === order.id ? "border-orange-500" : "border-neutral-200 hover:border-orange-200"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-neutral-900">{order.table.tableNumber}</h3>
                <p className="text-sm text-neutral-500">{order.items.length} items</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-600">₹{calculateSubtotal(order)}</p>
                <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md mt-1 uppercase inline-block">
                  {order.status}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Order Bill View */}
      {selectedOrder && (
        <div className="flex-[1.5] bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 print:shadow-none print:border-black print:border-2">
          <div className="text-center mb-8 flex flex-col items-center">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain mb-3" />
            )}
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">{settings.name}</h2>
            <p className="text-neutral-500 text-sm mt-1">Table {selectedOrder.table.tableNumber} Receipt</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex font-bold text-neutral-400 text-sm uppercase border-b pb-2 print:border-black">
              <span className="flex-[3]">Item</span>
              <span className="flex-1 text-center">Qty</span>
              <span className="flex-1 text-right">Price</span>
            </div>
            {selectedOrder.items.map((item: any) => (
              <div key={item.id} className="flex text-neutral-800 font-medium border-b border-neutral-100 pb-3 print:border-black">
                <span className="flex-[3] pr-2">{item.menuItem.name}</span>
                <span className="flex-1 text-center">{item.quantity}</span>
                <span className="flex-1 text-right">₹{item.priceAtOrderTime * item.quantity}</span>
              </div>
            ))}
          </div>

          {(() => {
            const subtotal = calculateSubtotal(selectedOrder);
            const gst = subtotal * 0.05;
            const total = subtotal + gst;
            return (
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 font-medium">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-neutral-900 pt-4 border-t border-neutral-200 print:border-black mt-4">
                  <span>Grand Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4 print:hidden mt-12">
            <button onClick={() => window.print()} className="col-span-2 py-4 rounded-xl border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2">
              <Printer size={18} /> Print Thermal Receipt
            </button>
            <button onClick={() => handlePay("cash")} className="py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 shadow-md">
              Mark Paid (Cash)
            </button>
            <button onClick={() => handlePay("online")} className="py-4 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md">
              Mark Paid (Online)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TAB 5: STORE SETTINGS
// ==========================================
function SettingsTab({ restaurantId }: { restaurantId: string }) {
  const [settings, setSettings] = useState({ name: "The Royal Dhaba", logoUrl: "", tableCount: 30 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId } 
        });
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-restaurant-id": restaurantId },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Store settings updated successfully! Missing QR tables have been auto-generated.");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-md animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Store Settings</h1>
        <p className="text-neutral-500 mt-2">Customize your restaurant branding for bills and QRs</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">Restaurant Name</label>
          <input 
            type="text" 
            value={settings.name}
            onChange={e => setSettings({...settings, name: e.target.value})}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="e.g. Spice Grill"
            required
          />
          <p className="text-xs text-neutral-400 mt-2">This name will be printed on all thermal receipts and QR codes.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">Logo Image URL (Optional)</label>
          <input 
            type="url" 
            value={settings.logoUrl || ""}
            onChange={e => setSettings({...settings, logoUrl: e.target.value})}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="https://example.com/logo.png"
          />
          {settings.logoUrl && (
            <div className="mt-4 p-4 border border-neutral-200 rounded-xl inline-block bg-neutral-50">
              <p className="text-xs text-neutral-400 mb-2 font-bold uppercase tracking-wider">Preview:</p>
              <img src={settings.logoUrl} alt="Logo Preview" className="h-16 object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2">Total Number of Tables</label>
          <input 
            type="number" 
            min="1"
            max="150"
            value={settings.tableCount}
            onChange={e => setSettings({...settings, tableCount: parseInt(e.target.value)})}
            className="w-full md:w-1/3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
            required
          />
          <p className="text-xs text-neutral-400 mt-2">If you increase this number, new tables (e.g. T31, T32) will be automatically generated for you in the Tables & QR tab.</p>
        </div>

        <div className="pt-6 border-t border-neutral-100 flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
