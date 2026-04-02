"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Hammer, HammerIcon, Search, Filter, 
  Clock, CheckCircle2, MessageSquare, 
  ChevronRight, ArrowUpRight, Shell,
  ShieldAlert, ShieldCheck, Zap, Droplets,
  AlertTriangle, Building, User, Info,
  ExternalLink, BarChart3, Activity
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function LandlordIssuesPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchIssues();
  }, [session]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issues/landlord`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setIssues(data);
    } catch (error) {
       console.error("Error fetching landlord issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.tenantId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.propertyId?.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && issue.status === statusFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'open': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'in_progress': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'closed': return 'bg-zinc-50 text-zinc-500 border-zinc-100';
      default: return 'bg-zinc-50 text-zinc-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full w-fit mb-2 animate-pulse">
                <HammerIcon className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Maintenance Center</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Incident Terminal</h1>
             <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Monitoring and resolving tenancy maintenance requests platform-wide. "</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 border border-zinc-200 rounded-[3rem] shadow-xl">
             <div className="bg-rose-50 h-12 w-12 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 font-black shadow-inner">
                <AlertTriangle className="h-6 w-6" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Critical Issues</p>
                <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">{issues.filter(i => i.priority === 'high' && i.status !== 'resolved').length} ONGOING</p>
             </div>
          </div>
        </div>

        {/* Issue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Open Tickets" value={issues.filter(i => i.status === 'open').length} icon={Hammer} color="amber" />
           <StatCard title="In Progress" value={issues.filter(i => i.status === 'in_progress').length} icon={Clock} color="indigo" />
           <StatCard title="Resolved" value={issues.filter(i => i.status === 'resolved').length} icon={ShieldCheck} color="emerald" />
           <StatCard title="Pending Review" value={issues.filter(i => i.status === 'open' && i.priority === 'high').length} icon={ShieldAlert} color="rose" />
        </div>

        {/* Global Ticket List */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2.5rem] shadow-xl ring-1 ring-zinc-50">
             <div className="relative flex-1">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
               <input
                 type="text"
                 placeholder="Search tickets by ID, property, or tenant..."
                 className="w-full pl-16 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all font-display italic tracking-tight"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <select
               className="px-8 py-4 bg-white border border-zinc-200 rounded-[2rem] text-sm font-black uppercase tracking-widest text-zinc-500 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all cursor-pointer shadow-sm"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="all">Global Status</option>
               <option value="open">Open</option>
               <option value="in_progress">In Progress</option>
               <option value="resolved">Resolved</option>
               <option value="closed">Closed</option>
             </select>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-2xl relative">
              <div className="absolute right-0 top-0 p-12 opacity-5"><Activity className="h-60 w-60" /></div>
              <table className="w-full text-left border-collapse relative z-10">
                 <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Reference / Entity</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Category / Appliance</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Priority</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Resolution Status</th>
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
                           <p className="text-zinc-400 font-black italic text-lg font-display underline underline-offset-8 decoration-zinc-50">No maintenance tickets match your current filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue) => (
                        <tr key={issue._id} className="hover:bg-zinc-50/50 transition-colors group">
                           <td className="px-10 py-8">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-2">
                                    <p className="font-black text-zinc-900 tracking-tight text-base group-hover:translate-x-1 transition-transform">{issue.title}</p>
                                    <div className="p-1 px-1.5 bg-zinc-100 border border-zinc-200 rounded text-[8px] font-black text-zinc-400 uppercase italic">#{issue._id.slice(-6).toUpperCase()}</div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5"><Building className="h-3 w-3 text-zinc-300" /><span className="text-[10px] font-bold text-zinc-400 uppercase">{issue.propertyId?.propertyName}</span></div>
                                    <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-zinc-300" /><span className="text-[10px] font-bold text-zinc-400 uppercase italic">{issue.tenantId?.name}</span></div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest italic">{issue.category}</span>
                                 <span className="text-[10px] font-bold text-zinc-400 italic leading-none">{issue.applianceName || "General Utility"}</span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                                 issue.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' : 
                                 issue.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                              }`}>
                                 {issue.priority === 'high' && <ShieldAlert className="h-3 w-3" />}
                                 {issue.priority}
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(issue.status)}`}>
                                 {issue.status.replace('_', ' ')}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <Link href={`/landlord/issues/${issue._id}`} className="p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-950 hover:text-white transition-all inline-block shadow-sm group-hover:scale-110 active:scale-95 border border-zinc-100">
                                 <ArrowUpRight className="h-5 w-5" />
                              </Link>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Security & Response Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 px-12 bg-zinc-50 border border-zinc-200 rounded-[3.5rem] items-center relative group overflow-hidden shadow-inner">
           <div className="absolute right-0 bottom-0 p-8 opacity-10"><BarChart3 className="h-40 w-40" /></div>
           <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
                 <ShieldCheck className="h-8 w-8 text-emerald-500" />
                 Resolution Performance
              </h3>
              <p className="text-sm font-bold text-zinc-500 leading-relaxed italic underline underline-offset-8 decoration-zinc-200">
                 " Ensuring a high resolution rate directly impacts your Landlord Service Score. Aim to acknowledge high-priority tickets within 12 hours of submission. "
              </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
