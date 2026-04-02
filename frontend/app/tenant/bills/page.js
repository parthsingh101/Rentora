"use client";

import { useEffect, useState } from "react";
import { 
  Receipt, Calendar, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, ArrowUpRight,
  DollarSign, Building, Home, FileText,
  CreditCard, Info
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function TenantBillsPage() {
  const { data: session } = useSession();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [session]);

  const fetchBills = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/tenant`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error("Error fetching tenant bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingBills = bills.filter(b => b.paymentStatus === 'pending');
  const paidBills = bills.filter(b => b.paymentStatus === 'paid');
  const totalDue = pendingBills.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">My Bills & Invoices</h1>
            <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Track your residency payments and utility usage history. "</p>
          </div>
          <div className="flex items-center gap-2 px-6 py-4 bg-zinc-950 text-white rounded-3xl shadow-xl">
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Outstanding</p>
                <p className="text-2xl font-black">₹{totalDue.toLocaleString()}</p>
             </div>
             <div className="ml-4 h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10"><DollarSign className="h-5 w-5" /></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Due Invoices" value={pendingBills.length} icon={Clock} color="amber" />
          <StatCard title="Paid History" value={paidBills.length} icon={CheckCircle2} color="emerald" />
          <StatCard title="Last Bill" value={bills.length > 0 ? `₹${bills[0].totalAmount.toLocaleString()}` : "N/A"} icon={Receipt} color="zinc" />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                 <FileText className="h-5 w-5 text-zinc-400" />
                 Recent Billing Statements
              </h2>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-[2.5rem] border border-zinc-200" />)}
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] space-y-4">
                   <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-zinc-300 border border-zinc-100"><Receipt className="h-8 w-8" /></div>
                   <p className="text-zinc-500 font-bold italic underline-offset-4 decoration-zinc-100 underline">No invoices have been generated for your account yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {bills.map((bill) => (
                      <Link 
                        key={bill._id} 
                        href={`/landlord/billing/${bill._id}`} // Shared detail page for both roles
                        className="block group"
                      >
                         <div className="p-6 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-zinc-300 transition-all relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                               <div className="flex items-center gap-6">
                                  <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-500 ${
                                     bill.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-zinc-50 text-zinc-400 border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white'
                                  }`}>
                                     {bill.paymentStatus === 'paid' ? <CheckCircle2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                                  </div>
                                  <div className="space-y-1">
                                     <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-zinc-900 tracking-tight">{bill.billingMonth} {bill.billingYear} Statement</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                                           bill.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                           {bill.paymentStatus}
                                        </span>
                                     </div>
                                     <p className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {bill.propertyId?.propertyName}, {bill.unitId?.unitName}</p>
                                  </div>
                               </div>

                               <div className="flex items-center gap-6">
                                  <div className="text-right">
                                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Amount</p>
                                     <p className="text-2xl font-black text-zinc-900 italic tracking-tighter">₹{bill.totalAmount.toLocaleString()}</p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                               </div>
                            </div>
                            <div className="absolute right-0 bottom-0 py-8 px-12 text-[8vw] font-black italic text-zinc-50/50 pointer-events-none group-hover:scale-110 transition-transform duration-700 select-none">#{bill._id.slice(-4).toUpperCase()}</div>
                         </div>
                      </Link>
                   ))}
                </div>
              )}
           </div>

           {/* Sidebar Info */}
           <div className="space-y-8">
              <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/5 rounded-full blur-3xl opacity-50" />
                 <h3 className="text-lg font-black uppercase tracking-widest border-b border-white/10 pb-4">Payment Methods</h3>
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 group">
                          <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 transition-colors group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30"><DollarSign className="h-5 w-5" /></div>
                          <div>
                             <p className="text-sm font-bold">UPI / Bank Transfer</p>
                             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mt-1">Manual Approval Required</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 group">
                          <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 transition-colors group-hover:bg-sky-500/20 group-hover:border-sky-500/30"><CreditCard className="h-5 w-5" /></div>
                          <div>
                             <p className="text-sm font-bold">Credit/Debit Card</p>
                             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mt-1 italic underline underline-offset-2 decoration-white/5">Coming Soon</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest">How to Pay?</h4>
                       <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">" Please coordinate with your landlord for direct bank transfer details. Once shared, upload a payment proof or notify them to mark the invoice as Paid in the system. "</p>
                    </div>

                    <button className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-zinc-100 transition-all active:scale-95">Support Ticket</button>
                 </div>
              </div>

              <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-[2.5rem] flex items-start gap-4">
                 <AlertCircle className="h-6 w-6 text-zinc-400 shrink-0 mt-1" />
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-900 underline underline-offset-4 decoration-emerald-200">Late Payment Policy</p>
                    <p className="text-[10px] font-black text-zinc-400/80 uppercase tracking-widest leading-relaxed">Ensure payments are cleared before the 5th of every month to maintain a high Tenant Score and avoid penalties.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
