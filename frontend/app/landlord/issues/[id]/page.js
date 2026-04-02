"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Hammer, Clock, CheckCircle2, 
  ShieldAlert, ShieldCheck, MessageSquare, 
  MapPin, Building, User, Calendar, 
  Upload, FileText, ArrowRight, Save,
  AlertTriangle, Phone, Mail, Zap, Droplets
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function IssueDetailPage() {
  const { id: issueId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [landlordNotes, setLandlordNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (issueId) fetchIssue();
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issues/${issueId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIssue(data);
        setStatus(data.status);
        setLandlordNotes(data.landlordNotes || "");
      } else {
        router.push("/landlord/issues");
      }
    } catch (err) {
      console.error("Error fetching issue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issues/${issueId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify({ status, landlordNotes }),
      });

      if (res.ok) {
        fetchIssue();
      }
    } catch (err) {
      console.error("Error updating issue status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center p-20"><div className="animate-spin h-8 w-8 border-b-2 border-zinc-900 rounded-full" /></div></DashboardLayout>;
  if (!issue) return <DashboardLayout><div className="p-20 text-center font-bold text-zinc-400 italic">Issue ticket not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link
              href={session?.user?.role === 'landlord' ? "/landlord/issues" : "/tenant/issues"}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Request Pool
            </Link>
            <div className="flex items-center gap-4">
               <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">{issue.title}</h1>
               <div className="p-1 px-1.5 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-black text-zinc-400 uppercase italic">ID: #{issue._id.slice(-8).toUpperCase()}</div>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 ${
             issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
             {issue.status === 'resolved' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
             {issue.status.replace('_', ' ')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Detailed Ticket Info */}
           <div className="lg:col-span-2 space-y-8">
              <section className="p-10 bg-white border border-zinc-200 rounded-[3.5rem] shadow-sm space-y-8 overflow-hidden relative group">
                 <div className="absolute right-0 top-0 p-12 opacity-5"><Hammer className="h-40 w-40" /></div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">{issue.category}</div>
                       <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${issue.priority === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-800">{issue.priority} Priority</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-50 pb-2">Problem Description</h3>
                       <p className="text-lg font-bold text-zinc-950 leading-relaxed italic underline underline-offset-8 decoration-zinc-50">" {issue.description} "</p>
                    </div>

                    {issue.applianceName && (
                       <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400"><Zap className="h-6 w-6" /></div>
                             <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Impacted Appliance</p>
                                <p className="text-sm font-black text-zinc-900 tracking-tight">{issue.applianceName}</p>
                             </div>
                          </div>
                          <Link href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-900">Inventory Logs <ArrowRight className="h-3 w-3" /></Link>
                       </div>
                    )}

                    {issue.imageUrl && (
                       <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-50 pb-2">Maintenance Attachment</h3>
                          <div className="rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-inner bg-zinc-50 group-hover:scale-[1.01] transition-transform duration-700">
                             <img src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${issue.imageUrl}`} alt="Problem proof" className="w-full h-auto object-cover cursor-zoom-in" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${issue.imageUrl}`, '_blank')} />
                          </div>
                       </div>
                    )}
                 </div>
              </section>

              {/* Resolution Terminal (Only for Landlord/Admin) */}
              {(session?.user?.role === 'landlord' || session?.user?.role === 'admin') && (
                 <section className="p-10 bg-zinc-950 text-white rounded-[3.5rem] shadow-2xl space-y-10 animate-in slide-in-from-bottom-10 duration-1000 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 p-12 opacity-5 scale-150 rotate-12"><ShieldCheck className="h-60 w-60" /></div>
                    
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6 relative z-10">
                       <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 italic font-black font-display tracking-widest">RVT</div>
                       <div>
                          <h3 className="text-xl font-black italic">Resolution Terminal</h3>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Acknowledge & Resolve Incident</p>
                       </div>
                    </div>

                    <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                       <div className="space-y-8">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Update Case Status</label>
                             <div className="grid grid-cols-2 gap-3">
                                {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                                   <button
                                     key={s}
                                     type="button"
                                     onClick={() => setStatus(s)}
                                     className={`py-4 rounded-2xl border transition-all text-[9.5px] font-black uppercase tracking-[0.15em] ${
                                        status === s ? 'bg-white text-zinc-950 border-white shadow-xl shadow-white/5' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                                     }`}
                                   >
                                      {s.replace('_', ' ')}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col justify-between space-y-8">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Resolution / Response Note</label>
                             <textarea 
                               placeholder="e.g. Dispatched plumber, should be at unit by 4 PM..."
                               className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-white/5 min-h-[140px] text-white"
                               value={landlordNotes}
                               onChange={(e) => setLandlordNotes(e.target.value)}
                             />
                          </div>

                          <button 
                             disabled={updating}
                             className={`w-full py-5 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                updating ? "bg-zinc-800 text-white/30 cursor-not-allowed" : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_20px_40px_-5px_rgba(255,255,255,0.2)]"
                             }`}
                          >
                             <Save className="h-5 w-5" />
                             {updating ? "Committing Updates..." : "Communicate Decision"}
                          </button>
                       </div>
                    </form>
                 </section>
              )}
           </div>

           {/* Sidebar Residency Data */}
           <div className="space-y-8">
              <section className="p-10 bg-white border border-zinc-200 rounded-[3.5rem] shadow-lg space-y-10">
                 <div className="space-y-8">
                    <div className="space-y-4 border-b border-zinc-50 pb-8">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Resident Profile
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100"><span className="text-sm font-black text-zinc-400">{issue.tenantId?.name.charAt(0)}</span></div>
                             <div>
                                <p className="text-sm font-black text-zinc-900 tracking-tight">{issue.tenantId?.name}</p>
                                <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {issue.tenantId?.email}</p>
                             </div>
                          </div>
                          <button className="w-full py-4 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center gap-2">
                             <Phone className="h-3.5 w-3.5" /> Call Tenant
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Property Location
                       </h3>
                       <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-4 group">
                          <div>
                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Asset Reference</p>
                             <p className="text-sm font-black text-zinc-900 group-hover:text-amber-600 transition-colors">{issue.propertyId?.propertyName}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                             <MapPin className="h-3 w-3" /> {issue.unitId?.unitName}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-50">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Case Opened</p>
                       </div>
                       <p className="text-sm font-bold text-zinc-950 italic flex items-center gap-2"><Calendar className="h-4 w-4 text-zinc-300" /> {new Date(issue.createdAt).toLocaleDateString()} {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                 </div>
              </section>

              {issue.landlordNotes && (
                 <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4 animate-in slide-in-from-right-8">
                    <div className="flex items-center gap-3">
                       <MessageSquare className="h-5 w-5 text-emerald-600" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 underline underline-offset-4 decoration-emerald-200">Resolution Dialogue</h3>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-800 leading-relaxed italic">" {issue.landlordNotes} "</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
