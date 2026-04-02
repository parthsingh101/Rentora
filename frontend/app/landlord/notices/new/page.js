"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Bell, Users, Building, 
  Globe, ShieldInfo, Info, Save, 
  ArrowRight, CheckCircle2, Megaphone,
  MailOpen, MailCheck, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewNoticePage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    noticeType: "general",
    targetType: "tenant",
    tenantId: "",
    propertyId: "",
  });

  useEffect(() => {
    fetchProperties();
    fetchTenants();
  }, [session]);

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`);
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/landlord/notices");
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to send notice");
      }
    } catch (err) {
      console.error("Error sending notice:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/landlord/notices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Publics
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Broadcast Manager</h1>
             <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white">Active Signal</span>
          </div>
          <p className="text-zinc-500 font-medium max-w-2xl">Broadcast structured announcements to specific tenants or entire properties managed by you.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <section className="p-10 bg-white border border-zinc-200 rounded-[3.5rem] shadow-sm space-y-10">
               <div className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Announcement Subject</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Schedule Maintenance for Tower A"
                       className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-lg font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all italic tracking-tighter"
                       value={formData.title}
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                       required
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Broadcast Type</label>
                        <select 
                          className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all text-zinc-900 cursor-pointer appearance-none italic"
                          value={formData.noticeType}
                          onChange={(e) => setFormData({...formData, noticeType: e.target.value})}
                        >
                           <option value="general">General Broadcast</option>
                           <option value="rent">Financial / Rent Update</option>
                           <option value="maintenance">Facility Maintenance</option>
                           <option value="inspection">Residency Inspection</option>
                           <option value="warning">Compliance Warning</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Audience Scope</label>
                        <select 
                          className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all text-emerald-600 appearance-none cursor-pointer italic"
                          value={formData.targetType}
                          onChange={(e) => setFormData({...formData, targetType: e.target.value, tenantId: "", propertyId: ""})}
                        >
                           <option value="tenant">Target: Specific Tenant</option>
                           <option value="property">Target: Property Wide</option>
                           <option value="all">Target: Global Tenants</option>
                        </select>
                     </div>
                  </div>

                  {formData.targetType === 'tenant' && (
                     <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Linked Tenant</label>
                        <select 
                          className="w-full px-8 py-5 bg-emerald-50/20 border border-emerald-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-950/5 transition-all"
                          value={formData.tenantId}
                          onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                          required
                        >
                           <option value="">Choose Recipient</option>
                           {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                        </select>
                     </div>
                  )}

                  {formData.targetType === 'property' && (
                     <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Property Base</label>
                        <select 
                          className="w-full px-8 py-5 bg-indigo-50/20 border border-indigo-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-950/5 transition-all"
                          value={formData.propertyId}
                          onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                          required
                        >
                           <option value="">Choose Property</option>
                           {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                        </select>
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Message Content</label>
                     <textarea 
                        placeholder="Type your announcement detail here. Ensure all vital information is clearly documented..."
                        className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] text-base font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all min-h-[220px] italic"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required
                     />
                  </div>
               </div>
            </section>
          </div>

          {/* Broadcast Sidebar */}
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
             <div className="p-10 bg-zinc-950 text-white rounded-[3.5rem] shadow-2xl space-y-8 sticky top-8">
                <div className="space-y-1 pb-6 border-b border-white/10">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Signal Status</p>
                   <h3 className="text-xl font-black italic">{loading ? "Broadcasting..." : "Awaiting Manual Trigger"}</h3>
                </div>

                <div className="space-y-6">
                   <div className="p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-center">
                      <Megaphone className="h-10 w-10 text-white/20" />
                      <p className="text-xs font-bold text-white/40 italic">This message will reach {formData.targetType === 'all' ? "Every Resident" : "Specific Segment"}</p>
                   </div>

                   {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{error}</div>}

                   <button 
                     type="submit"
                     disabled={loading}
                     className={`w-full py-5 rounded-[2rem] font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 ${
                       loading ? "bg-zinc-800 text-white/30 cursor-not-allowed" : "bg-white text-zinc-950 hover:bg-zinc-50 shadow-2xl shadow-indigo-500/20"
                     }`}
                   >
                      {loading ? "Activating..." : (
                        <>
                           <CheckCircle2 className="h-5 w-5" />
                           Initiate Broadcast
                        </>
                      )}
                   </button>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex items-start gap-4">
                   <ShieldInfo className="h-6 w-6 text-emerald-400 shrink-0 mt-1" />
                   <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Platform Records</p>
                      <p className="text-[11px] font-medium text-white/60 leading-relaxed italic underline underline-offset-4 decoration-white/10">Official notices serve as legal records in residency archives.</p>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-start gap-4">
                <Info className="h-6 w-6 text-zinc-300 shrink-0 mt-1" />
                <p className="text-xs font-bold text-zinc-400 italic leading-relaxed">
                   Double check targeted recipient list. All messages are transmitted immediately upon publication.
                </p>
             </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
