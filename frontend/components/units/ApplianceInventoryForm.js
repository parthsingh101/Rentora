"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, Settings, Package } from "lucide-react";

export default function ApplianceInventoryForm({ inventory, setInventory }) {
  const addAppliance = () => {
    setInventory([
      ...inventory,
      { name: "", category: "Electronics", status: "Working" },
    ]);
  };

  const removeAppliance = (index) => {
    const newInventory = inventory.filter((_, i) => i !== index);
    setInventory(newInventory);
  };

  const updateAppliance = (index, field, value) => {
    const newInventory = [...inventory];
    newInventory[index][field] = value;
    setInventory(newInventory);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-zinc-500" />
          Appliance Inventory
        </h3>
        <button
          type="button"
          onClick={addAppliance}
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Appliance
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
          <p className="text-sm text-zinc-500">No appliances added yet. Click above to add some.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inventory.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-zinc-300 transition-all group"
            >
              <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateAppliance(index, "name", e.target.value)}
                  placeholder="e.g. AC, Fridge, Fan"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  required
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</label>
                <select
                  value={item.category}
                  onChange={(e) => updateAppliance(index, "category", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Fixture">Fixture</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
                <select
                  value={item.status}
                  onChange={(e) => updateAppliance(index, "status", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                >
                  <option value="Working">Working</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Replacement Due">Replacement Due</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <div className="flex items-end pb-1.5">
                <button
                  type="button"
                  onClick={() => removeAppliance(index)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove appliance"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
