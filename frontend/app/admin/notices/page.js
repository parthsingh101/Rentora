"use client";

import { useEffect, useState } from "react";
import { 
  Shield, Bell, Search, Filter, 
  Trash2, Globe, Building, User, 
  Calendar, CheckCircle2, Megaphone,
  MailCheck, ShieldInfo, BarChart3,
  Activity, ArrowUpRight, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminNoticesPage() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNotices();
  }, [session]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/admin`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setNotices(data);
    } catch (error) {
       console.error("Error fetching admin notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(notice => 
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.landlordId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full w-fit mb-2 animate-pulse">
                <Shield className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Global Communication Oversight</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Broadcast Tower</h1>
             <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Monitoring the platform-wide distribution of announcements and alerts. "</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 border border-zinc-200 rounded-[2.5rem] shadow-xl">
             <div className="bg-rose-50 h-12 w-12 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-inner">
                <Megaphone className="h-6 w-6 animate-swing" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Platform Signal</p>
                <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">{notices.length} MESSAGES</p>
             </div>
          </div>
        </div>

        {/* Global Messaging Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Total Notices" value={notices.length} icon={Bell} color="zinc" />
           <StatCard title="Warnings Sent" value={notices.filter(n => n.noticeType === 'warning').length} icon={AlertTriangle} color="rose" />
           <StatCard title="Universal" value={notices.filter(n => n.targetType === 'all').length} icon={Globe} color="emerald" />
           <StatCard title="Throughput" value="12/Day" icon={Activity} color="indigo" />
        </div>

        {/* Global Broadcast List */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
             <div className="relative flex-1">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
               <input
                 type="text"
                 placeholder="Search documents by subject or landlord..."
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
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Broadcast Reference</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Originating Landlord</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Audience Scope</th>
                       <th className="px-10 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Type</th>
                       <th className="px-10 py-6"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                      [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-10 py-12 bg-zinc-50/20"></td></tr>)
                    ) : filteredNotices.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-10 py-24 text-center space-y-4">
                           <ShieldInfo className="h-12 w-12 text-zinc-100 mx-auto" />
                           <p className="text-zinc-400 font-bold italic font-display text-lg underline underline-offset-8 decoration-zinc-100">The platform broadcast logs are currently empty.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredNotices.map((notice) => (
                        <tr key={notice._id} className="hover:bg-zinc-50/50 transition-colors group">
                           <td className="px-10 py-8">
                              <div className="space-y-0.5">
                                 <p className="font-black text-zinc-900 text-sm tracking-tight">{notice.title}</p>
                                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Published {new Date(notice.createdAt).toLocaleDateString()}</p>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-black text-zinc-800">{notice.landlordId?.name}</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-zinc-400 leading-none">ID: {notice.landlordId?._id.slice(-6).toUpperCase()}</span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-2">
                                 {notice.targetType === 'all' ? <Globe className="h-3 w-3 text-emerald-500" /> : notice.targetType === 'property' ? <Building className="h-3 w-3 text-indigo-500" /> : <User className="h-3 w-3 text-zinc-400" />}
                                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{notice.targetType === 'all' ? "Universal" : notice.targetType.replace('_', ' ')}</span>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 notice.noticeType === 'warning' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                              }`}>
                                 {notice.noticeType}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <Link href={`/landlord/notices/${notice._id}`} className="p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all inline-block shadow-sm group-hover:scale-105 active:scale-95 border border-zinc-100">
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

        {/* Global Compliance & Ethics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 px-12 bg-zinc-950 text-white rounded-[4rem] items-center relative group overflow-hidden shadow-2xl">
           <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12 scale-150"><BarChart3 className="h-60 w-60" /></div>
           <div className="space-y-4 relative z-10">
              <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 italic">
                 <ShieldInfo className="h-10 w-10 text-emerald-400" />
                 Broadcast Governance
              </h3>
              <p className="text-base font-bold text-white/40 leading-relaxed italic underline underline-offset-8 decoration-white/5">
                 " Ensure all platform announcements maintain residency standards. Broadcast patterns are monitored for spam or unprofessional discourse. Audit records are maintained for all admin oversight. "
              </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
