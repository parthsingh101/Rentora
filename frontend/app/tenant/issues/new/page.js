"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, AlertCircle, Hammer, 
  Upload, FileText, Zap, Droplets, 
  ShieldAlert, ShieldCheck, Save,
  ArrowRight, Info, CheckCircle2,
  Lock, Globe, Building, User, Laptop
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ReportIssuePage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [unitInventory, setUnitInventory] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "plumbing",
    applianceName: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    fetchTenantAssignment();
  }, [session]);

  const fetchTenantAssignment = async () => {
    try {
      // Find active assignment for this tenant to get unit inventory
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/tenant/active`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      if (res.ok && data.unitId) {
         setUnitInventory(data.unitId.applianceInventory || []);
      }
    } catch (err) {
      console.error("Error fetching tenant assignment:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("image", file);
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("applianceName", formData.applianceName);
    data.append("description", formData.description);
    data.append("priority", formData.priority);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issues`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` },
        body: data,
      });

      if (res.ok) {
        router.push("/tenant/issues");
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to report issue");
      }
    } catch (err) {
      console.error("Error reporting issue:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/tenant/issues"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Requests
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Raise Ticket</h1>
             <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white">Security Verified</span>
          </div>
          <p className="text-zinc-500 font-medium max-w-2xl">Report any structural, utility or appliance failures. Our maintenance team will prioritize and resolve your concern.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <section className="p-10 bg-white border border-zinc-200 rounded-[3.5rem] shadow-sm space-y-10">
                <div className="space-y-8">
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Problem Title</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Living room AC not cooling"
                         className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-lg font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all italic tracking-tighter"
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         required
                       />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category</label>
                         <select 
                           className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all italic text-zinc-900 cursor-pointer appearance-none"
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                         >
                            <option value="plumbing">Plumbing</option>
                            <option value="electrical">Electrical</option>
                            <option value="appliance">Appliance Maintenance</option>
                            <option value="structural">Structural / Civil</option>
                            <option value="hvac">HVAC / Cooling</option>
                            <option value="cleaning">General Maintenance</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Linked Appliance (Optional)</label>
                         <select 
                           className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all italic text-emerald-600 cursor-pointer appearance-none"
                           value={formData.applianceName}
                           onChange={(e) => setFormData({...formData, applianceName: e.target.value})}
                         >
                            <option value="">No specific appliance</option>
                            {unitInventory.map((app, idx) => (
                               <option key={idx} value={app.name}>{app.name} ({app.status})</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Problem Description</label>
                      <textarea 
                        placeholder="Please describe the issue in detail. When did it start? Are there specific sounds or smells?"
                        className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] text-base font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all min-h-[160px] italic"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                   </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 space-y-6">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Priority Selection</p>
                   <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'low', label: 'Low', color: 'zinc' },
                        { id: 'medium', label: 'Mid', color: 'amber' },
                        { id: 'high', label: 'High', color: 'rose' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({...formData, priority: p.id})}
                          className={`py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                            formData.priority === p.id 
                            ? `border-zinc-950 bg-zinc-950 text-white shadow-xl` 
                            : `border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-300`
                          }`}
                        >
                           {p.label}
                        </button>
                      ))}
                   </div>
                </div>
             </section>
          </div>

          {/* Submission Sidebar */}
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
             <div className="p-10 bg-zinc-950 text-white rounded-[3.5rem] shadow-2xl space-y-8 sticky top-8">
                <div className="space-y-1 pb-6 border-b border-white/10">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Digital Attachment</p>
                   <h3 className="text-xl font-black italic">{file ? file.name : "Visual Documentation"}</h3>
                </div>

                <div className="space-y-6">
                   <div className="group relative">
                      <input 
                         type="file" 
                         accept="image/*,.pdf"
                         onChange={(e) => setFile(e.target.files[0])}
                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="px-6 py-12 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group-hover:border-white transition-all text-center">
                         <Upload className="h-10 w-10 text-white/20 group-hover:scale-110 transition-transform" />
                         <p className="text-xs font-bold text-white/40">{file ? `File: ${file.name}` : "Tap to add Photo proof"}</p>
                      </div>
                   </div>

                   {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{error}</div>}

                   <button 
                     type="submit"
                     disabled={loading}
                     className={`w-full py-5 rounded-[1.8rem] font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 ${
                       loading ? "bg-zinc-800 text-white/30 cursor-not-allowed" : "bg-white text-zinc-950 hover:bg-zinc-50 shadow-2xl shadow-indigo-500/20"
                     }`}
                   >
                      {loading ? "Publishing Ticket..." : (
                        <>
                           <CheckCircle2 className="h-5 w-5" />
                           Submit Request
                        </>
                      )}
                   </button>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex items-start gap-4">
                   <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0 mt-1" />
                   <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fair Usage</p>
                      <p className="text-[11px] font-medium text-white/60 leading-relaxed italic italic underline underline-offset-2 decoration-white/5">False or minor reports may lead to residency scoring penalties. Ensure reports are accurate.</p>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-start gap-4">
                <Info className="h-6 w-6 text-zinc-300 mt-1 shrink-0" />
                <p className="text-xs font-bold text-zinc-400 italic leading-relaxed">
                   Average response time for {formData.priority} priority tickets is 24-48 business hours. You'll receive a notification once assigned.
                </p>
             </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
