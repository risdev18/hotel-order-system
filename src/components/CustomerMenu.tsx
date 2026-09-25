"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Search, UtensilsCrossed, BellRing } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

export default function CustomerMenu({ tableId, tableNumber, categories }: any) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cart = useCartStore();

  const handleCallWaiter = async () => {
    // API call to alert waiter
    alert("Waiter has been called.");
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, items: cart.items })
      });
      if (res.ok) {
        alert("Order placed successfully!");
        cart.clearCart();
        setIsCartOpen(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    }
  };

  return (
    <div className="relative pb-24 font-sans max-w-md mx-auto min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
              <UtensilsCrossed size={24} className="text-orange-500" /> 
              The Royal Dhaba
            </h1>
            <p className="text-sm text-neutral-400">Table {tableNumber}</p>
          </div>
          <button 
            onClick={handleCallWaiter}
            className="p-2 rounded-full bg-neutral-800 text-orange-400 hover:bg-neutral-700 transition-colors"
          >
            <BellRing size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text" 
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 overflow-hidden">
            <button 
              onClick={() => setFilter("all")} 
              className={cn("px-3 py-1 text-xs font-medium rounded-lg transition-all", filter === "all" ? "bg-neutral-700 text-white" : "text-neutral-400")}
            >All</button>
            <button 
              onClick={() => setFilter("veg")} 
              className={cn("px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1", filter === "veg" ? "bg-green-500/20 text-green-400" : "text-neutral-400")}
            >
              <div className="w-2 h-2 border border-green-500 rounded-sm flex items-center justify-center"><div className="w-1 h-1 bg-green-500 rounded-full" /></div>
              Veg
            </button>
            <button 
              onClick={() => setFilter("nonveg")} 
              className={cn("px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1", filter === "nonveg" ? "bg-red-500/20 text-red-400" : "text-neutral-400")}
            >
              <div className="w-2 h-2 border border-red-500 rounded-sm flex items-center justify-center"><div className="w-1 h-1 bg-red-500 rounded-full" /></div>
              Non
            </button>
          </div>
        </div>
      </header>

      {/* Categories Horizontal Scroll */}
      <div className="sticky top-[116px] z-30 bg-neutral-950/90 backdrop-blur-md border-b border-white/5 py-3 px-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === cat.id 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 pt-6 pb-20 space-y-8">
        {categories.map((cat: any) => {
          if (activeCategory !== cat.id && !searchQuery) return null;
          
          const filteredItems = cat.items.filter((item: any) => {
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filter === "veg" && !item.vegFlag) return false;
            if (filter === "nonveg" && item.vegFlag) return false;
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-4">
              {searchQuery && <h2 className="text-lg font-bold text-white mb-2">{cat.name}</h2>}
              {filteredItems.map((item: any) => {
                const cartItem = cart.items.find(i => i.id === item.id);
                const quantity = cartItem?.quantity || 0;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.id} 
                    className="flex gap-4 bg-neutral-900/50 border border-white/5 rounded-2xl p-3 items-center"
                  >
                    {/* Item details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-3 h-3 border rounded-sm flex items-center justify-center shrink-0", item.vegFlag ? "border-green-500" : "border-red-500")}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.vegFlag ? "bg-green-500" : "bg-red-500")} />
                        </div>
                        <h3 className="text-base font-semibold text-neutral-100">{item.name}</h3>
                      </div>
                      <p className="text-orange-400 font-bold mb-1">₹{item.price}</p>
                      {item.description && <p className="text-xs text-neutral-500 line-clamp-2">{item.description}</p>}
                    </div>

                    {/* Add to Cart logic */}
                    <div className="shrink-0 w-24 flex justify-end">
                      {quantity > 0 ? (
                        <div className="flex items-center bg-orange-500 rounded-lg overflow-hidden shadow-lg shadow-orange-500/20 h-9">
                          <button 
                            onClick={() => cart.updateQuantity(item.id, quantity - 1)}
                            className="w-8 h-full flex items-center justify-center text-white bg-black/10 active:bg-black/20"
                          ><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                          <button 
                            onClick={() => cart.updateQuantity(item.id, quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-white bg-black/10 active:bg-black/20"
                          ><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => cart.addItem({ id: item.id, name: item.name, price: item.price, quantity: 1, vegFlag: item.vegFlag })}
                          className="px-5 py-2 rounded-lg bg-orange-500/10 text-orange-500 font-semibold border border-orange-500/20 active:bg-orange-500/20 transition-colors text-sm"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        })}
      </div>

      {/* Floating View Cart Button */}
      <AnimatePresence>
        {cart.items.length > 0 && !isCartOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl shadow-[0_10px_25px_rgba(249,115,22,0.4)] flex justify-between items-center text-white font-bold"
            >
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-white/80">{cart.items.reduce((acc, i) => acc + i.quantity, 0)} Items</span>
                <span className="text-lg">₹{cart.getTotal()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>View Cart</span>
                <ShoppingCart size={20} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Bottom Sheet */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neutral-900 border-t border-white/10 rounded-t-3xl p-5 z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-6">Your Order</h2>
              
              <div className="space-y-4 mb-8">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 border rounded-sm flex items-center justify-center shrink-0", item.vegFlag ? "border-green-500" : "border-red-500")}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.vegFlag ? "bg-green-500" : "bg-red-500")} />
                        </div>
                        <h4 className="text-white font-medium">{item.name}</h4>
                      </div>
                      <p className="text-neutral-400 text-sm ml-5">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center bg-neutral-800 rounded-lg overflow-hidden h-8 border border-white/5">
                      <button 
                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-white bg-black/20"
                      ><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-white bg-black/20"
                      ><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mb-8">
                <div className="flex justify-between text-neutral-400 mb-2 text-sm">
                  <span>Subtotal</span>
                  <span>₹{cart.getTotal()}</span>
                </div>
                <div className="flex justify-between text-neutral-400 mb-2 text-sm">
                  <span>GST (5%)</span>
                  <span>₹{(cart.getTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl mt-4 pt-4 border-t border-white/5">
                  <span>Grand Total</span>
                  <span className="text-orange-500">₹{(cart.getTotal() * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-4 rounded-xl border border-white/10 text-white font-semibold active:bg-white/5 transition-colors"
                >
                  Add More
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Place Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
