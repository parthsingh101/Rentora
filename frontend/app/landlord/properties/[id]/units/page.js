"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, Home, ChevronLeft, MoreHorizontal, LayoutGrid, List as ListIcon, Search, Filter, Home as PropertyIcon, Users, CreditCard, AlertTriangle, Package } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function PropertyUnitsPage() {
  const { id: propertyId } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewType, setViewType] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real app, use apiClient.get
      const propRes = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
      const propData = await propRes.json();
      setProperty(propData);

      const unitsRes = await fetch(`http://localhost:5000/api/units/property/${propertyId}`);
      const unitsData = await unitsRes.json();
      setUnits(unitsData);
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || unit.occupancyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const vacantCount = units.filter(u => u.occupancyStatus === 'vacant').length;
  const occupiedCount = units.filter(u => u.occupancyStatus === 'occupied').length;
  const maintenanceCount = units.filter(u => u.occupancyStatus === 'maintenance').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header and Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
              <Link href="/landlord/properties" className="hover:text-zinc-900 transition-colors">Properties</Link>
              <span>/</span>
              {property && <Link href={`/landlord/properties/${propertyId}`} className="hover:text-zinc-900 transition-colors">{property.propertyName}</Link>}
              <span>/</span>
              <span className="text-zinc-900 font-medium">Units</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Units for {property?.propertyName || "Property"}
            </h1>
          </div>
          <Link
            href={`/landlord/properties/${propertyId}/units/new`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add New Unit
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Units" value={units.length} icon={Home} color="zinc" />
          <StatCard title="Vacant" value={vacantCount} icon={Package} color="emerald" />
          <StatCard title="Occupied" value={occupiedCount} icon={Users} color="blue" />
          <StatCard title="Maintenance" value={maintenanceCount} icon={AlertTriangle} color="amber" />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search units..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <div className="flex border border-zinc-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 transition-colors ${viewType === "grid" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-2 transition-colors ${viewType === "list" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-2xl border border-zinc-200" />
            ))}
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
            <div className="bg-zinc-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">No units found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mb-6">
              Start by adding units to your property to begin managing your rental inventory.
            </p>
            <Link
              href={`/landlord/properties/${propertyId}/units/new`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all"
            >
              <Plus className="h-5 w-5" />
              Add First Unit
            </Link>
          </div>
        ) : viewType === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => (
              <Link key={unit._id} href={`/landlord/units/${unit._id}`} className="group block h-full">
                <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors">
                      <Home className="h-6 w-6 text-zinc-600" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      unit.occupancyStatus === 'vacant' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      unit.occupancyStatus === 'occupied' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {unit.occupancyStatus}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1">{unit.unitName}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-zinc-500 font-medium">Rent: ₹{unit.monthlyRent?.toLocaleString()}</p>
                    <p className="text-sm text-zinc-500 font-medium">Deposit: ₹{unit.securityDeposit?.toLocaleString()}</p>
                  </div>
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{unit.applianceInventory?.length || 0} Appliances</span>
                    <span className="text-sm font-semibold text-zinc-900 group-hover:underline underline-offset-4">Manage Unit →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Unit Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Rent</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Appliances</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredUnits.map((unit) => (
                  <tr key={unit._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{unit.unitName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        unit.occupancyStatus === 'vacant' ? 'bg-emerald-100 text-emerald-800' :
                        unit.occupancyStatus === 'occupied' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {unit.occupancyStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-700">₹{unit.monthlyRent?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400 font-bold">{unit.applianceInventory?.length || 0} Items</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/landlord/units/${unit._id}`} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <MoreHorizontal className="h-5 w-5 ml-auto" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
