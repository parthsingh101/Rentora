"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Upload, FileText, Building, 
  User, Shield, Lock, Globe, Save, Info,
  CheckCircle2, FolderPlus, MapPin, Home,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewDocumentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    documentType: "agreement",
    visibility: "shared",
    tenantId: "",
    propertyId: "",
    unitId: "",
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

  const fetchUnits = async (propertyId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/property/${propertyId}`);
      const data = await res.json();
      setUnits(data);
    } catch (err) {
      console.error("Error fetching units:", err);
    }
  };

  const handlePropertyChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, propertyId: val, unitId: "" });
    if (val) fetchUnits(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file to upload.");
    
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("documentType", formData.documentType);
    data.append("visibility", formData.visibility);
    if (formData.tenantId) data.append("tenantId", formData.tenantId);
    if (formData.propertyId) data.append("propertyId", formData.propertyId);
    if (formData.unitId) data.append("unitId", formData.unitId);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: data,
      });

      if (res.ok) {
        router.push("/landlord/documents");
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to upload document");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
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
            href="/landlord/documents"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Documents
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Upload New Document</h1>
          <p className="text-zinc-500 font-medium max-w-2xl">Maintain a comprehensive digital record of all residency agreements, identifications, and formal legal notices.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-10 bg-white border border-zinc-200 rounded-[3rem] shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Document Title</label>
                     <input 
                       type="text" 
                       placeholder="e.g. 2024 Lease Agreement - Unit 101"
                       className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                       value={formData.title}
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                       required
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category</label>
                        <select 
                          className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all appearance-none cursor-pointer"
                          value={formData.documentType}
                          onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                        >
                           <option value="agreement">Agreement</option>
                           <option value="id_proof">ID Proof</option>
                           <option value="receipt">Receipt</option>
                           <option value="notice">Notice</option>
                           <option value="other">Other</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Visibility</label>
                        <select 
                          className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all text-emerald-600 appearance-none cursor-pointer"
                          value={formData.visibility}
                          onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                        >
                           <option value="shared">Shared (Tenants & Landlord)</option>
                           <option value="landlord_only">Private (Landlord Only)</option>
                           <option value="tenant">Tenant Specific</option>
                        </select>
                     </div>
                  </div>
               </div>
               
               <div className="pt-8 border-t border-zinc-50 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="h-2 w-2 bg-zinc-900 rounded-full" />
                     <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Associations (Optional)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Assign to Property</label>
                        <select 
                          className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                          value={formData.propertyId}
                          onChange={handlePropertyChange}
                        >
                          <option value="">No Property</option>
                          {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Assign to Unit</label>
                        <select 
                           className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                           value={formData.unitId}
                           disabled={!formData.propertyId}
                           onChange={(e) => setFormData({...formData, unitId: e.target.value})}
                        >
                          <option value="">No Unit</option>
                          {units.map(u => <option key={u._id} value={u._id}>{u.unitName}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Assign to Tenant (Recipient)</label>
                     <select 
                       className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                       value={formData.tenantId}
                       onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                     >
                       <option value="">No Tenant</option>
                       {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                     </select>
                  </div>
               </div>
            </section>
          </div>

          {/* Upload Sidebar */}
          <div className="space-y-6">
            <div className="p-10 bg-zinc-950 text-white rounded-[3rem] shadow-2xl space-y-8 sticky top-8">
               <div className="space-y-1 pb-6 border-b border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Selected File</p>
                  <h3 className="text-xl font-black italic">{file ? file.name : "Unassigned Digital Copy"}</h3>
               </div>

               <div className="space-y-6">
                  <div className="group relative">
                     <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        required
                     />
                     <div className="p-10 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:border-white transition-all text-center">
                        <Upload className="h-10 w-10 text-white/20 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-white/40">{file ? `File: ${file.name}` : "Tap to browse or Drop residency document here"}</p>
                     </div>
                  </div>

                  {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{error}</div>}

                  <button 
                    type="submit"
                    disabled={loading || !file}
                    className={`w-full py-5 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      loading || !file ? "bg-zinc-800 text-white/30 cursor-not-allowed" : "bg-white text-zinc-950 hover:bg-zinc-50 shadow-2xl shadow-white/5"
                    }`}
                  >
                     {loading ? "Publishing..." : (
                       <>
                          <Save className="h-5 w-5" />
                          Publish to Archive
                       </>
                     )}
                  </button>
               </div>
               
               <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                     {formData.visibility === 'shared' ? <Globe className="h-5 w-5 text-emerald-400" /> : <Lock className="h-5 w-5 text-zinc-500" />}
                     <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Permission Level</p>
                        <p className="text-xs font-bold text-white uppercase">{formData.visibility.replace('_', ' ')}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-[2rem] flex items-start gap-4">
               <Info className="h-6 w-6 text-zinc-300 shrink-0 mt-1" />
               <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
                  Digital documents are stored in a secure platform vault. Access is restricted based on the visibility level selected above. Max file size: 10MB.
               </p>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
