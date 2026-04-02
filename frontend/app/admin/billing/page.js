"use client";

import { useEffect, useState } from "react";
import { 
  Shield, Receipt, Calendar, Clock, 
  CheckCircle2, AlertCircle, Search, Filter,
  Building, User, Home, ArrowUpRight,
  BarChart3, PieChart, Activity
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminBillingPage() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/landlord`, { // Admin can currently use landlord endpoint if role permits all, but let's assume a dedicated one later
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching admin bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.tenantId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.propertyId?.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.landlordId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && bill.paymentStatus === statusFilter;
  });

  const totalPlatformRevenue = bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full w-fit mb-2 animate-pulse">
                <Shield className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Admin Oversight</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Financial Logistics</h1>
             <p className="text-zinc-500 font-medium">Platform-wide overview of all generated invoices and transactions.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 border border-zinc-200 rounded-[2.5rem] shadow-xl">
             <div className="bg-emerald-50 h-12 w-12 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 italic font-black shadow-inner shadow-emerald-500/10">₹</div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Gross Volume (Paid)</p>
                <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">₹{totalPlatformRevenue.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Total Invoices" value={bills.length} icon={Receipt} color="zinc" />
           <StatCard title="Paid Volume" value={bills.filter(b => b.paymentStatus === 'paid').length} icon={CheckCircle2} color="emerald" />
           <StatCard title="Pending" value={bills.filter(b => b.paymentStatus === 'pending').length} icon={Clock} color="amber" />
           <StatCard title="Total Tenants" value={new Set(bills.map(b => b.tenantId?._id)).size} icon={User} color="rose" />
        </div>

        {/* Platform-wide List */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
             <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
               <input
                 type="text"
                 placeholder="Search by tenant, property, or landlord..."
                 className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-display"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <select
               className="px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">Global Status</option>
               <option value="pending">Pending</option>
               <option value="paid">Paid</option>
               <option value="overdue">Overdue</option>
             </select>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Reference / Period</th>
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Parties Involved</th>
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Volume</th>
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan="5" className="px-8 py-10 bg-zinc-50/20"></td>
                        </tr>
                      ))
                    ) : filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center space-y-2">
                           <Receipt className="h-10 w-10 text-zinc-200 mx-auto" />
                           <p className="text-zinc-400 font-bold italic">No financial data matches your current platform filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill) => (
                        <tr key={bill._id} className="hover:bg-zinc-50/50 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="space-y-0.5">
                                 <p className="font-black text-zinc-900 uppercase text-xs tracking-tighter italic">#{bill._id.slice(-8).toUpperCase()}</p>
                                 <p className="text-xs font-bold text-zinc-400">{bill.billingMonth} {bill.billingYear}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-black text-zinc-800">{bill.tenantId?.name}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-zinc-200" />
                                    <span className="text-[10px] font-bold text-zinc-400 leading-none">{bill.landlordId?.name} (Landlord)</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right font-black text-zinc-950 font-display italic">
                              ₹{bill.totalAmount.toLocaleString()}
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 bill.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                 {bill.paymentStatus}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <Link href={`/landlord/billing/${bill._id}`} className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all inline-block shadow-sm">
                                 <ArrowUpRight className="h-4 w-4" />
                              </Link>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Platform Insights Decor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 px-12 bg-white border border-zinc-200 rounded-[3.5rem] shadow-xl relative overflow-hidden items-center group">
           <div className="absolute -left-10 top-0 h-full w-40 bg-zinc-50 pointer-events-none opacity-50" />
           <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                 <Activity className="h-8 w-8 text-emerald-500" />
                 Compliance Monitoring
              </h3>
              <p className="text-sm font-bold text-zinc-500 leading-relaxed italic underline underline-offset-8 decoration-zinc-100">
                 " Ensure all residency settlements are in alignment with local rental statutes and platform regulations. Automated tracking for tax visibility is currently being processed. "
              </p>
           </div>
           <div className="flex flex-wrap gap-4 relative z-10 justify-end opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
              <BarChart3 className="h-20 w-20 text-zinc-200" />
              <PieChart className="h-20 w-20 text-zinc-200" />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
