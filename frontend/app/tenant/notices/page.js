"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Search, Filter, 
  Globe, Building, Users,
  AlertTriangle, Info, CheckCircle2,
  MailOpen, ArrowRight, Calendar,
  ShieldInfo, MessageSquare, Megaphone,
  MailCheck, Trash2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function TenantNoticesPage() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, [session]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/tenant`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setNotices(data);
    } catch (error) {
       console.error("Error fetching tenant notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      if (res.ok) fetchNotices();
    } catch (error) {
      console.error("Error marking notice as read:", error);
    }
  };

  const getNoticeStyle = (type) => {
    switch (type) {
      case 'warning': return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-200';
      case 'rent': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-200';
      case 'maintenance': return 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-200';
      case 'inspection': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-200';
      default: return 'bg-zinc-50 text-zinc-500 border-zinc-100 ring-zinc-200';
    }
  };

  const getTargetLabel = (notice) => {
    if (notice.targetType === 'all') return "Global Broadcast";
    if (notice.targetType === 'property') return "Property Update";
    return "Personal Alert";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Residency Inbox</h1>
             <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Official announcements and alerts regarding your tenancy. "</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 border border-zinc-200 rounded-[3rem] shadow-xl ring-1 ring-zinc-50 transition-all hover:scale-105 active:scale-95">
             <div className="bg-emerald-50 h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner">
                <Bell className="h-6 w-6 animate-swing" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Unread Signal</p>
                <p className="text-xl md:text-2xl font-black text-zinc-900 tracking-tighter italic">{notices.filter(n => !n.isRead).length} ALERTS</p>
             </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Total Notices" value={notices.length} icon={MailOpen} color="zinc" />
           <StatCard title="Priority" value={notices.filter(n => n.noticeType === 'warning').length} icon={AlertTriangle} color="rose" />
           <StatCard title="Financial" value={notices.filter(n => n.noticeType === 'rent').length} icon={MailCheck} color="amber" />
           <StatCard title="Facility" value={notices.filter(n => n.noticeType === 'maintenance').length} icon={ShieldInfo} color="indigo" />
        </div>

        {/* Messaging List */}
        <div className="space-y-6">
           {loading ? (
             <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 rounded-[3.5rem] border border-zinc-200" />)}
             </div>
           ) : notices.length === 0 ? (
             <div className="text-center py-24 bg-white border-2 border-dashed border-zinc-100 rounded-[3.5rem] space-y-6">
                <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-zinc-200"><MailOpen className="h-8 w-8" /></div>
                <div className="space-y-2">
                   <p className="text-zinc-900 font-black text-2xl italic font-display">Inbox is clear</p>
                   <p className="text-zinc-500 max-w-xs mx-auto font-medium text-sm">No new residency announcements from your landlord.</p>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {notices.map((notice) => (
                   <div 
                     key={notice._id} 
                     onClick={() => !notice.isRead && markAsRead(notice._id)}
                     className={`group p-10 rounded-[3.5rem] border-2 transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px] cursor-pointer ${
                        notice.isRead ? 'bg-white border-zinc-100 grayscale-[0.2]' : 'bg-white border-zinc-950 shadow-2xl ring-4 ring-zinc-950/5'
                     }`}
                   >
                       <div className="absolute right-0 top-0 p-12 opacity-5"><Megaphone className="h-48 w-48" /></div>
                       
                       <div className="space-y-8 relative z-10">
                          <div className="flex justify-between items-start">
                             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ring-1 ${getNoticeStyle(notice.noticeType)}`}>
                                {notice.noticeType}
                             </div>
                             {!notice.isRead && <div className="h-3 w-3 bg-rose-500 rounded-full animate-pulse shadow-rose-500/50 shadow-lg" />}
                             {notice.isRead && <MailCheck className="h-5 w-5 text-emerald-500 animate-in fade-in" />}
                          </div>

                          <div className="space-y-2">
                             <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight group-hover:translate-x-1 transition-transform italic underline underline-offset-8 decoration-zinc-100 line-clamp-1">{notice.title}</h3>
                             <p className="text-[12px] font-medium text-zinc-500 line-clamp-2 leading-relaxed italic border-l-4 border-zinc-50 pl-4">" {notice.message} "</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-8 border-t border-zinc-50 relative z-10 mt-6">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none flex items-center gap-1.5 underline underline-offset-2 decoration-zinc-50"><Calendar className="h-3.5 w-3.5" /> Published {new Date(notice.createdAt).toLocaleDateString()}</p>
                             <p className="text-[9px] font-bold text-zinc-400 italic">#{notice._id.slice(-6).toUpperCase()} • {getTargetLabel(notice)}</p>
                          </div>
                          <Link href={`/landlord/notices/${notice._id}`} className="p-4 bg-zinc-50 rounded-[1.5rem] group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm active:scale-90 ring-1 ring-zinc-100">
                             <ArrowRight className="h-5 w-5" />
                          </Link>
                       </div>
                   </div>
                ))}
             </div>
           )}
        </div>
        
        {/* Support Section */}
        <div className="p-12 bg-zinc-950 text-white rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
           <div className="absolute -left-10 top-0 h-full w-40 bg-white/5 pointer-events-none opacity-20" />
           <div className="space-y-6 relative z-10">
              <h3 className="text-3xl font-black italic flex items-center gap-4">
                 <ShieldInfo className="h-10 w-10 text-emerald-400 group-hover:scale-125 transition-transform duration-700" />
                 Official Directives
              </h3>
              <p className="text-base font-bold text-white/30 leading-relaxed italic max-w-lg underline underline-offset-8 decoration-white/10">
                 " Residency notices form the legal foundation for property management communication. Please review all announcements carefully as they impact your tenancy status. "
              </p>
           </div>
           <button className="px-12 py-5 bg-white text-zinc-950 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-zinc-50 transition-all active:scale-95 relative z-10 border-4 border-white/10">Knowledge Base</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
