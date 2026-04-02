"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, Plus, Search, Filter, 
  Send, Users, Building, Globe,
  AlertTriangle, ShieldInfo, Info,
  CheckCircle2, ChevronRight, ArrowUpRight,
  Megaphone, MailOpen, MailCheck
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function LandlordNoticesPage() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, [session]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/landlord`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setNotices(data);
    } catch (error) {
       console.error("Error fetching landlord notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNoticeBadge = (type) => {
    switch (type) {
      case 'rent': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">Financial</span>;
      case 'maintenance': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">Maintenance</span>;
      case 'inspection': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">Inspection</span>;
      case 'warning': return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100">Warning</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-50 text-zinc-500 border border-zinc-100">General</span>;
    }
  };

  const getTargetIcon = (target) => {
    switch (target) {
      case 'all': return <Globe className="h-4 w-4 text-emerald-500" />;
      case 'property': return <Building className="h-4 w-4 text-indigo-500" />;
      default: return <Users className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Broadcast Center</h1>
             <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Communicate vital announcements and residency updates to your tenants. "</p>
          </div>
          <Link
            href="/landlord/notices/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-zinc-950 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
          >
            <Send className="h-5 w-5" />
            Compose Broadcast
          </Link>
        </div>

        {/* Messaging Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title="Sent Alerts" value={notices.length} icon={Megaphone} color="zinc" />
           <StatCard title="Property Wide" value={notices.filter(n => n.targetType === 'property').length} icon={Building} color="indigo" />
           <StatCard title="Warnings" value={notices.filter(n => n.noticeType === 'warning').length} icon={AlertTriangle} color="rose" />
        </div>

        {/* Global Broadcast History */}
        <div className="space-y-6">
           <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2 italic">
              <MailOpen className="h-5 w-5 text-zinc-400" />
              Messaging Pipeline
           </h2>

           {loading ? (
             <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-[2.5rem] border border-zinc-200" />)}
             </div>
           ) : notices.length === 0 ? (
             <div className="text-center py-24 bg-white border-2 border-dashed border-zinc-100 rounded-[3.5rem] space-y-6">
                <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-zinc-200"><Bell className="h-8 w-8" /></div>
                <div className="space-y-1">
                   <p className="text-zinc-900 font-black text-xl italic font-display">No announcements sent</p>
                   <p className="text-zinc-500 max-w-xs mx-auto font-medium text-sm">Start broadcasting updates to keep your tenants informed.</p>
                </div>
                <Link href="/landlord/notices/new" className="inline-block px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Send First Notice</Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {notices.map((notice) => (
                   <div 
                     key={notice._id} 
                     className="group p-6 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
                   >
                       <div className="absolute left-0 top-0 h-full w-20 bg-zinc-50 opacity-50 -z-10 skew-x-[-20deg] -translate-x-10" />
                       
                       <div className="flex items-center gap-6 flex-1 w-full">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 transition-transform group-hover:scale-110 ${
                             notice.noticeType === 'warning' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                          }`}>
                            <Bell className="h-6 w-6" />
                          </div>
                          <div className="space-y-1 flex-1">
                             <div className="flex items-center gap-3">
                                <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-none group-hover:translate-x-1 transition-transform">{notice.title}</h3>
                                {getNoticeBadge(notice.noticeType)}
                             </div>
                             <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                   {getTargetIcon(notice.targetType)}
                                   {notice.targetType === 'tenant' ? notice.tenantId?.name : notice.targetType === 'property' ? notice.propertyId?.propertyName : "Broadcast All"}
                                </div>
                                <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest leading-none flex items-center gap-1.5">
                                   <MailCheck className="h-3 w-3" />
                                   Published {new Date(notice.createdAt).toLocaleDateString()}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-zinc-50 pt-4 md:pt-0">
                          <p className="text-[10px] font-black italic text-zinc-400 uppercase tracking-widest ml-auto md:ml-0">#{notice._id.slice(-6).toUpperCase()}</p>
                          <Link href={`/landlord/notices/${notice._id}`} className="p-3 bg-zinc-50 text-zinc-900 rounded-xl hover:bg-zinc-950 hover:text-white transition-all shadow-sm active:scale-95 border border-zinc-100">
                             <ArrowUpRight className="h-4 w-4" />
                          </Link>
                       </div>
                   </div>
                ))}
             </div>
           )}
        </div>
        
        {/* Governance Info */}
        <div className="p-10 bg-zinc-50 border border-zinc-200 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner relative group overflow-hidden">
           <div className="absolute right-0 bottom-0 p-8 opacity-10"><ShieldInfo className="h-40 w-40" /></div>
           <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black italic flex items-center gap-3">
                 <ShieldInfo className="h-8 w-8 text-black" />
                 Professional Discourse
              </h3>
              <p className="text-sm font-bold text-zinc-400 leading-relaxed italic max-w-lg underline underline-offset-8 decoration-zinc-200">
                 " Maintain high communication standards. All notices are logged permanently in residency history and serve as official platform records. "
              </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
