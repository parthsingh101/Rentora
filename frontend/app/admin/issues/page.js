"use client";

import { useEffect, useState } from "react";
import { 
  Shield, Hammer, Search, Filter, 
  Clock, CheckCircle2, AlertTriangle, 
  Building, User, ArrowUpRight, 
  BarChart3, Activity, ShieldCheck,
  ShieldAlert, Settings, Info
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminIssuesPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIssues();
  }, [session]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issues/landlord`, { // Admin can see all via this endpoint if backend allows or dedicated admin endpoint
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setIssues(data);
    } catch (error) {
       console.error("Error fetching admin issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.landlordId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.tenantId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full w-fit mb-2 animate-pulse">
                <Shield className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Global Maintenance Oversight</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Logistics Control</h1>
             <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Monitoring the platform-wide resolution performance of maintenance incidents. "</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 border border-zinc-200 rounded-[2.5rem] shadow-xl">
             <div className="bg-amber-50 h-12 w-12 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 font-black shadow-inner">
                <Settings className="h-6 w-6" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">System Load</p>
                <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">{issues.filter(i => i.status !== 'resolved').length} ACTIVE TICKETS</p>
             </div>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Total Tickets" value={issues.length} icon={Hammer} color="zinc" />
           <StatCard title="Priority (High)" value={issues.filter(i => i.priority === 'high').length} icon={ShieldAlert} color="rose" />
           <StatCard title="Resolution Rate" value={`${Math.round((issues.filter(i => i.status === 'resolved').length / (issues.length || 1)) * 100)}%`} icon={ShieldCheck} color="emerald" />
           <StatCard title="Avg Response" value="1.4 Days" icon={Clock} color="indigo" />
        </div>

        {/* Global Ticket Management Table */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
             <div className="relative flex-1">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
               <input
                 type="text"
                 placeholder="Search tickets by property, landlord, or tenant..."
                 className="w-full pl-16 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-display italic tracking-tight"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button className="px-8 py-4 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Audit Filters
             </button>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm relative">
              <div className="absolute right-0 top-0 p-12 opacity-5"><Activity className="h-60 w-60" /></div>
              <table className="w-full text-left border-collapse relative z-10">
                 <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Incident Reference</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Parties</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Priority</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Status / Lifecycle</th>
                       <th className="px-10 py-6"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                      [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-10 py-12 bg-zinc-50/20"></td></tr>)
                    ) : filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-10 py-24 text-center space-y-4">
                           <ShieldCheck className="h-12 w-12 text-zinc-100 mx-auto" />
                           <p className="text-zinc-400 font-bold italic font-display text-lg underline underline-offset-8 decoration-zinc-100">The platform maintenance logs are empty for this selection.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue) => (
                        <tr key={issue._id} className="hover:bg-zinc-50/50 transition-colors group">
                           <td className="px-10 py-8">
                              <div className="space-y-0.5">
                                 <p className="font-black text-zinc-900 text-sm tracking-tight">{issue.title}</p>
                                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic flex items-center gap-1.5"><Building className="h-3 w-3" /> {issue.propertyId?.propertyName}</p>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black text-zinc-800 uppercase italic leading-none">{issue.tenantId?.name} (Tenant)</span>
                                 </div>
                                 <div className="flex items-center gap-2 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                                    <span className="text-[10px] font-bold text-zinc-400 leading-none">{issue.landlordId?.name} (Landlord)</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                 issue.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                              }`}>
                                 {issue.priority}
                              </span>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                 {issue.status.replace('_', ' ')}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <Link href={`/landlord/issues/${issue._id}`} className="p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-950 hover:text-white transition-all inline-block shadow-sm group-hover:scale-105 active:scale-95">
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

        {/* Global Compliance Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 px-12 bg-zinc-50 border border-zinc-200 rounded-[3.5rem] items-center relative group overflow-hidden shadow-inner">
           <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12 scale-150"><BarChart3 className="h-60 w-60" /></div>
           <div className="space-y-4 relative z-10">
              <h3 className="text-3xl font-black text-zinc-950 tracking-tighter flex items-center gap-3">
                 <ShieldAlert className="h-10 w-10 text-rose-500" />
                 Compliance Governance
              </h3>
              <p className="text-base font-bold text-zinc-500 leading-relaxed italic underline underline-offset-8 decoration-zinc-100">
                 " Ensure all residency maintenance incidents across the platform are being addressed in alignment with local rental statutes and platform regulations. Audit trails are recorded for all admin oversight actions. "
              </p>
           </div>
           <div className="flex justify-end p-4 relative z-10 opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
              <PieChart className="h-28 w-28 text-zinc-200" />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
