"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertCircle, Plus, Search, Filter, 
  Clock, CheckCircle2, Hammer, Tool, 
  MessageSquare, ChevronRight, ArrowUpRight,
  ShieldAlert, ShieldCheck, Zap, Droplets
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function TenantIssuesPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [session]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issues/tenant`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setIssues(data);
    } catch (error) {
       console.error("Error fetching tenant issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">Ticket Open</span>;
      case 'in_progress': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">In Progress</span>;
      case 'resolved': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">Resolved</span>;
      case 'closed': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-50 text-zinc-500 border border-zinc-100">Closed</span>;
      default: return null;
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <ShieldAlert className="h-4 w-4 text-rose-500" title="High Priority" />;
    return <Clock className="h-4 w-4 text-zinc-400" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Maintenance Requests</h1>
            <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Report residency issues or appliance failures for immediate repair. "</p>
          </div>
          <Link
            href="/tenant/issues/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-zinc-950 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Report New Issue
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title="Total Tickets" value={issues.length} icon={Hammer} color="zinc" />
           <StatCard title="Unresolved" value={issues.filter(i => i.status === 'open' || i.status === 'in_progress').length} icon={Clock} color="amber" />
           <StatCard title="Fixed Issues" value={issues.filter(i => i.status === 'resolved').length} icon={CheckCircle2} color="emerald" />
        </div>

        {/* Main List */}
        <div className="space-y-6">
           <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-zinc-400" />
              Ticket History
           </h2>

           {loading ? (
             <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-[2.5rem] border border-zinc-200" />)}
             </div>
           ) : issues.length === 0 ? (
             <div className="text-center py-24 bg-white border-2 border-dashed border-zinc-100 rounded-[3.5rem] space-y-6">
                <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-zinc-200"><Hammer className="h-8 w-8" /></div>
                <div className="space-y-1">
                   <p className="text-zinc-900 font-black text-xl italic font-display">No ongoing issues</p>
                   <p className="text-zinc-500 max-w-xs mx-auto font-medium text-sm">Everything seems to be working perfectly in your unit.</p>
                </div>
                <Link href="/tenant/issues/new" className="inline-block px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Report Concern</Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issues.map((issue) => (
                   <Link 
                     key={issue._id} 
                     href={`/landlord/issues/${issue._id}`}
                     className="group p-8 bg-white border border-zinc-200 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-zinc-300 transition-all relative overflow-hidden flex flex-col justify-between min-h-[240px]"
                   >
                       <div className="absolute right-0 top-0 p-8 opacity-5"><Hammer className="h-24 w-24" /></div>
                       
                       <div className="space-y-6 relative z-10">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                {getStatusBadge(issue.status)}
                                <div className={`h-1.5 w-1.5 rounded-full ${issue.priority === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-300'}`} />
                             </div>
                             <div className="p-3 bg-zinc-50 text-zinc-400 rounded-xl group-hover:bg-zinc-950 group-hover:text-white transition-all">
                                <ArrowUpRight className="h-4 w-4" />
                             </div>
                          </div>

                          <div className="space-y-1">
                             <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-tight group-hover:translate-x-1 transition-transform">{issue.title}</h3>
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                {issue.category} {issue.applianceName && `• ${issue.applianceName}`}
                             </p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-8 border-t border-zinc-50 relative z-10">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 border border-zinc-100 italic font-black text-[9px] uppercase tracking-tighter">#{issue._id.slice(-6).toUpperCase()}</div>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Added {new Date(issue.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                             {getPriorityIcon(issue.priority)}
                             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{issue.priority}</span>
                          </div>
                       </div>
                   </Link>
                ))}
             </div>
           )}
        </div>
        
        {/* Support Decor */}
        <div className="p-10 bg-zinc-950 text-white rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute -left-10 top-0 h-full w-40 bg-white/5 pointer-events-none opacity-20" />
           <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black italic flex items-center gap-3">
                 <ShieldCheck className="h-8 w-8 text-emerald-400" />
                 Emergency Response
              </h3>
              <p className="text-sm font-bold text-white/40 leading-relaxed italic max-w-lg underline underline-offset-8 decoration-white/5">
                 " For life-threatening emergencies or critical utility failures (Fire, Major Leaks, Gas), please contact local authorities immediately before filing a ticket. "
              </p>
           </div>
           <button className="px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-zinc-100 transition-all active:scale-95 relative z-10">Emergency Contacts</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
