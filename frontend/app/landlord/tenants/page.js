"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, 
  Home, ChevronRight, MoreHorizontal, UserCheck, 
  UserMinus, Clock, LayoutGrid, List as ListIcon 
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function TenantListPage() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, assignmentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
          headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
          headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
        })
      ]);

      const tenantsData = await tenantsRes.json();
      const assignmentsData = await assignmentsRes.json();

      setTenants(tenantsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching tenant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveAssignment = (tenantId) => {
    return assignments.find(a => a.tenantId?._id === tenantId && a.status === 'active');
  };

  const filteredTenants = tenants.filter(tenant => {
    const activeAssign = getActiveAssignment(tenant._id);
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "active") return matchesSearch && activeAssign;
    if (statusFilter === "vacated") return matchesSearch && !activeAssign;
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display">Tenant Management</h1>
            <p className="text-zinc-500 font-medium">Manage your rental community and lease assignments.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/landlord/tenants/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
            >
              <UserPlus className="h-5 w-5" />
              New account
            </Link>
            <Link
              href="/landlord/assignments/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95"
            >
              <Home className="h-5 w-5" />
              Assign unit
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Tenants" value={tenants.length} icon={Users} color="zinc" />
          <StatCard title="Active Leases" value={assignments.filter(a => a.status === 'active').length} icon={UserCheck} color="emerald" />
          <StatCard title="Past Tenants" value={assignments.filter(a => a.status === 'vacated').length} icon={UserMinus} color="amber" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Tenants</option>
            <option value="vacated">Past Tenants</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-3xl border border-zinc-200" />
            ))}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
            <div className="bg-zinc-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 font-display">No tenants found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mb-6">
              You haven't added or assigned any tenants yet. Create an account or assign a unit to start.
            </p>
            <div className="flex items-center justify-center gap-3">
               <Link href="/landlord/tenants/new" className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold">New Account</Link>
               <Link href="/landlord/assignments/new" className="px-5 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold">Assign Unit</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => {
              const activeAssign = getActiveAssignment(tenant._id);
              return (
                <Link key={tenant._id} href={`/landlord/tenants/${tenant._id}`} className="group block h-full">
                  <div className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-lg hover:border-zinc-300 transition-all h-full relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-zinc-600" />
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        activeAssign ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}>
                        {activeAssign ? "Active" : "No active lease"}
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <h3 className="text-xl font-bold text-zinc-900 group-hover:text-black">{tenant.name}</h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium truncate">{tenant.email}</span>
                        </div>
                        {tenant.phone && (
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{tenant.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {activeAssign ? (
                      <div className="mt-4 pt-4 border-t border-zinc-100">
                         <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Property</p>
                               <p className="text-xs font-bold text-zinc-700 line-clamp-1">{activeAssign.propertyId?.propertyName}</p>
                            </div>
                            <div className="space-y-0.5 text-right">
                               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Unit</p>
                               <p className="text-xs font-bold text-zinc-700">{activeAssign.unitId?.unitName}</p>
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-zinc-100 italic text-xs text-zinc-400 font-medium">
                        Last seen {new Date(tenant.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronRight className="h-5 w-5 text-zinc-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
