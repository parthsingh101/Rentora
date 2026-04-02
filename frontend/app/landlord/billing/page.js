"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Receipt, Plus, Filter, Search, Calendar, 
  CheckCircle2, Clock, AlertCircle, FileText,
  ChevronRight, ArrowUpRight, DollarSign, Building,
  ArrowRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function LandlordBillingPage() {
  const { data: session } = useSession();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBills();
  }, [session]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/landlord`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (billId, status) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBills();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.tenantId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.propertyId?.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && bill.paymentStatus === statusFilter;
  });

  const stats = {
    totalRevenue: bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
    pendingAmount: bills.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalAmount, 0),
    overdueItems: bills.filter(b => b.paymentStatus === 'pending' && new Date(b.dueDate) < new Date()).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display">Invoices & Billing</h1>
            <p className="text-zinc-500 font-medium">Manage monthly rent and additional utility charges.</p>
          </div>
          <Link
            href="/landlord/billing/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Generate Bill
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Revenue (Paid)" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={CheckCircle2} color="emerald" />
          <StatCard title="Pending" value={`₹${stats.pendingAmount.toLocaleString()}`} icon={Clock} color="amber" />
          <StatCard title="Upcoming/Overdue" value={stats.overdueItems} icon={AlertCircle} color="rose" />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by tenant or property..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-zinc-100 transition-colors">
              <Filter className="h-5 w-5 text-zinc-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-zinc-100 rounded-[2rem] border border-zinc-200" />
            ))}
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] space-y-6">
            <div className="bg-zinc-50 h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto border border-zinc-100">
               <Receipt className="h-10 w-10 text-zinc-300" />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-bold text-zinc-900 font-display">No invoices found</h3>
               <p className="text-zinc-500 max-w-sm mx-auto font-medium">Create your first monthly bill for an assigned tenant to track rent and utility payments.</p>
            </div>
            <Link href="/landlord/billing/new" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold shadow-xl hover:bg-zinc-800 transition-all">
               Generate New Bill
               <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBills.map((bill) => (
              <div key={bill._id} className="group p-6 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-zinc-50 rounded-[1.5rem] flex items-center justify-center border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                      <Receipt className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-zinc-900">{bill.tenantId?.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          bill.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {bill.propertyId?.propertyName}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {bill.billingMonth} {bill.billingYear}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total Bill</p>
                        <p className="text-2xl font-black text-zinc-900">₹{bill.totalAmount.toLocaleString()}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <Link 
                          href={`/landlord/billing/${bill._id}`}
                          className="p-3 bg-zinc-50 text-zinc-900 rounded-2xl hover:bg-zinc-100 transition-colors border border-zinc-100"
                        >
                          <FileText className="h-5 w-5" />
                        </Link>
                        {bill.paymentStatus === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(bill._id, 'paid')}
                            className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                          >
                            Mark Paid
                          </button>
                        )}
                        <Link href={`/landlord/billing/${bill._id}/edit`} className="p-3 bg-zinc-50 text-zinc-600 rounded-2xl hover:bg-zinc-100 transition-colors">
                           <ArrowUpRight className="h-5 w-5" />
                        </Link>
                     </div>
                  </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-zinc-50/50 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
