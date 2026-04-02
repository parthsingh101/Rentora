"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Bell, Calendar, 
  User, Building, Globe, 
  Trash2, MailOpen, MailCheck,
  Megaphone, MessageSquare, ShieldInfo,
  Info, AlertTriangle, ArrowRight, Save
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NoticeDetailPage() {
  const { id: noticeId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (noticeId) fetchNotice();
  }, [noticeId]);

  const fetchNotice = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices/${noticeId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotice(data);
      } else {
        router.push(session?.user?.role === 'landlord' ? "/landlord/notices" : "/tenant/notices");
      }
    } catch (err) {
      console.error("Error fetching notice:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNoticeBadge = (type) => {
    switch (type) {
      case 'warning': return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100 ring-rose-200">Broadcast: Warning</span>;
      default: return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-950 text-white border-zinc-900">Broadcast: {type}</span>;
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center p-20"><div className="animate-spin h-8 w-8 border-b-2 border-zinc-900 rounded-full" /></div></DashboardLayout>;
  if (!notice) return <DashboardLayout><div className="p-20 text-center font-bold text-zinc-400 italic">Notice not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-50">
          <div className="space-y-4">
            <Link
              href={session?.user?.role === 'landlord' ? "/landlord/notices" : "/tenant/notices"}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Residency Inbox
            </Link>
            <div className="flex flex-wrap items-center gap-6">
               <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">{notice.title}</h1>
               {getNoticeBadge(notice.noticeType)}
            </div>
          </div>
          <div className="p-1 px-1.5 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-black text-zinc-400 uppercase italic">ID: #{notice._id.slice(-10).toUpperCase()}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Announcement Content */}
           <div className="lg:col-span-2 space-y-10">
              <section className="p-12 md:p-16 bg-white border border-zinc-200 rounded-[4rem] shadow-sm relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-16 opacity-5"><Megaphone className="h-48 w-48" /></div>
                 
                 <div className="space-y-10 relative z-10">
                    <div className="flex items-center gap-4 border-l-4 border-zinc-950 pl-6">
                       <p className="text-2xl font-bold text-zinc-950 leading-relaxed italic underline underline-offset-8 decoration-zinc-50 tracking-tight">" {notice.message} "</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-zinc-50">
                       <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">Audience Scope</h3>
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400">
                                {notice.targetType === 'all' ? <Globe className="h-5 w-5" /> : notice.targetType === 'property' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                             </div>
                             <div>
                                <p className="text-sm font-black text-zinc-900 tracking-tight italic uppercase">{notice.targetType === 'property' ? "Property Wide" : notice.targetType === 'all' ? "Universal Tenants" : "Single Account"}</p>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Classification Hub</p>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">Residency Timeline</h3>
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400"><Calendar className="h-5 w-5" /></div>
                             <div>
                                <p className="text-sm font-black text-zinc-900 tracking-tight italic">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Initiation Epoch</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Related Residency Data */}
              {notice.targetType === 'property' && notice.propertyId && (
                 <section className="p-10 bg-zinc-950 text-white rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                       <div className="h-16 w-16 bg-white/10 rounded-[2rem] border border-white/10 flex items-center justify-center text-emerald-400"><Building className="h-8 w-8" /></div>
                       <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Linked Property Profile</p>
                          <h4 className="text-2xl font-black italic tracking-tighter">{notice.propertyId.propertyName}</h4>
                          <p className="text-xs font-bold text-white/50">{notice.propertyId.address}</p>
                       </div>
                    </div>
                    <Link href={`/landlord/properties/${notice.propertyId._id}`} className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-zinc-100 active:scale-95 transition-all">View Asset</Link>
                 </section>
              )}
           </div>

           {/* Sidebar Logistics */}
           <div className="space-y-8">
              <section className="p-10 bg-white border border-zinc-200 rounded-[3.5rem] shadow-lg space-y-10 relative overflow-hidden">
                 <div className="absolute -right-10 -top-10 opacity-5"><ShieldInfo className="h-40 w-40" /></div>
                 
                 <div className="space-y-8 relative z-10">
                    <div className="space-y-4 pb-8 border-b border-zinc-50">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Authoritative Origin
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-inner group"><p className="text-sm font-black text-zinc-400 group-hover:scale-125 transition-transform">{notice.landlordId?.name.charAt(0)}</p></div>
                             <div>
                                <p className="text-sm font-black text-zinc-900 tracking-tight">{notice.landlordId?.name}</p>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">Verified Landlord</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8 pt-4">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                          <ShieldInfo className="h-4 w-4" />
                          Broadcast Compliance
                       </h3>
                       <div className="space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm"><AlertTriangle className="h-5 w-5" /></div>
                             <p className="text-[11px] font-bold text-zinc-400 italic leading-relaxed">" This message is a permanently recorded communication in the residency archive. "</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              {session?.user?.role === 'tenant' && !notice.isRead && (
                 <button 
                   onClick={() => markAsRead(notice._id)}
                   className="w-full p-8 bg-zinc-950 text-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center gap-4 hover:bg-zinc-900 transition-all active:scale-95 group"
                 >
                    <MailCheck className="h-10 w-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">Acknowledge Broadcast</p>
                 </button>
              )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
