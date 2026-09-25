"use client";

import { useState, useEffect } from "react";
import { Plus, Building2, Lock, Trash2, KeyRound } from "lucide-react";

export default function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    slug: "",
    password: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "GanpatiBappaMorya") {
      setIsAuthenticated(true);
      fetchRestaurants();
    } else {
      alert("Incorrect master password");
    }
  };

  const fetchRestaurants = async () => {
    const res = await fetch("/api/superadmin/restaurants");
    const data = await res.json();
    setRestaurants(data.restaurants || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/superadmin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant)
      });
      if (res.ok) {
        alert("Restaurant created successfully!");
        setNewRestaurant({ name: "", slug: "", password: "" });
        fetchRestaurants();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create restaurant");
      }
    } catch (err) {
      alert("Error creating restaurant");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-neutral-900 p-8 rounded-3xl w-full max-w-sm border border-neutral-800">
          <div className="flex justify-center mb-6 text-purple-500"><KeyRound size={48} /></div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Super Admin Login</h2>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Master Password"
            className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white mb-4" autoFocus
          />
          <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700">Unlock Master Panel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 flex items-center gap-3">
              <Building2 className="text-purple-600" /> SmartHotel Master Control
            </h1>
            <p className="text-neutral-500 mt-2">Manage your SaaS clients and onboard new restaurants.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Restaurant Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold mb-6">Onboard New Client</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Restaurant Name</label>
                <input type="text" required value={newRestaurant.name} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} className="w-full bg-neutral-50 border rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:border-purple-500" placeholder="e.g. Sagar Ratna" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">URL Slug</label>
                <input type="text" required value={newRestaurant.slug} onChange={e => setNewRestaurant({...newRestaurant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} className="w-full bg-neutral-50 border rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:border-purple-500" placeholder="e.g. sagar-ratna" />
                <p className="text-xs text-neutral-400 mt-1">Customers will visit smarthotel.com/order/<b>{newRestaurant.slug || "slug"}</b></p>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Admin Password</label>
                <input type="text" required value={newRestaurant.password} onChange={e => setNewRestaurant({...newRestaurant, password: e.target.value})} className="w-full bg-neutral-50 border rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:border-purple-500" placeholder="Give this to the owner" />
              </div>
              <button type="submit" disabled={isCreating} className="w-full bg-neutral-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800">
                <Plus size={18} /> {isCreating ? "Creating..." : "Create Restaurant Database"}
              </button>
            </form>
          </div>

          {/* List of Clients */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-6">Active Clients ({restaurants.length})</h2>
            {restaurants.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center text-neutral-500">No restaurants onboarded yet.</div>
            ) : (
              restaurants.map(rest => (
                <div key={rest.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{rest.name}</h3>
                    <p className="text-sm text-neutral-500 mt-1">Slug: <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{rest.slug}</span></p>
                    <p className="text-sm text-neutral-500 mt-1">Password: <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{rest.password}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-700">{rest._count.tables} Tables</p>
                    <p className="text-sm font-bold text-neutral-700">{rest._count.orders} Orders</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
