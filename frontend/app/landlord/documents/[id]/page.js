"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, FileText, Download, Trash2, 
  Clock, User, Building, MapPin, 
  Lock, Globe, Shield, Calendar, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DocumentDetailPage() {
  const { id: docId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (docId) fetchDocument();
  }, [docId]);

  const fetchDocument = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDoc(data);
      } else {
        router.push("/landlord/documents");
      }
    } catch (err) {
      console.error("Error fetching document:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document permanently?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      if (res.ok) router.push("/landlord/documents");
    } catch (error) {
       console.error("Error deleting document:", error);
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center p-20"><div className="animate-spin h-8 w-8 border-b-2 border-zinc-900 rounded-full" /></div></DashboardLayout>;
  if (!doc) return <DashboardLayout><div className="p-20 text-center font-bold text-zinc-400 italic">Document not found.</div></DashboardLayout>;

  const fileUrl = `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${doc.fileUrl}`;
  const isImage = doc.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPdf = doc.fileUrl.match(/\.pdf$/i);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link
              href="/landlord/documents"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Archive
            </Link>
            <div className="flex items-center gap-4">
               <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">{doc.title}</h1>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  doc.documentType === 'agreement' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'
               }`}>
                  {doc.documentType.replace('_', ' ')}
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <a 
               href={fileUrl} 
               target="_blank" 
               className="px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-zinc-800 transition-all active:scale-95"
             >
                <Download className="h-5 w-5" />
                Download Copy
             </a>
             {session?.user?.role === 'landlord' && (
                <button 
                  onClick={handleDelete}
                  className="p-4 bg-white border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all"
                >
                   <Trash2 className="h-5 w-5" />
                </button>
             )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Preview Panel */}
           <div className="lg:col-span-2 space-y-6">
              <div className="p-8 bg-zinc-50 border-4 border-white rounded-[3.5rem] shadow-inner min-h-[600px] flex items-center justify-center relative overflow-hidden">
                 {isImage ? (
                    <img src={fileUrl} alt={doc.title} className="max-w-full h-auto rounded-3xl shadow-2xl ring-1 ring-zinc-200" />
                 ) : isPdf ? (
                    <iframe src={fileUrl} className="w-full h-[600px] rounded-3xl border border-zinc-200 shadow-2xl" />
                 ) : (
                    <div className="text-center space-y-6">
                       <div className="h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-zinc-100"><FileText className="h-12 w-12 text-zinc-400" /></div>
                       <div>
                          <p className="text-xl font-black text-zinc-900">Preview Unavailable</p>
                          <p className="text-sm font-medium text-zinc-400">Word or document files must be downloaded to view.</p>
                       </div>
                       <a href={fileUrl} className="inline-block px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Download Now</a>
                    </div>
                 )}
                 <div className="absolute right-0 bottom-0 p-8 flex items-center gap-2 opacity-30 select-none">
                    <Shield className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{doc._id.slice(-6).toUpperCase()}</span>
                 </div>
              </div>
           </div>

           {/* Metadata Panel */}
           <div className="space-y-8">
              <section className="p-10 bg-white border border-zinc-200 rounded-[3rem] shadow-lg space-y-10 relative overflow-hidden">
                 <div className="absolute -right-10 -top-10 opacity-5"><FileText className="h-40 w-40" /></div>
                 
                 <div className="space-y-8 relative z-10">
                    <div className="space-y-2 pb-6 border-b border-zinc-100">
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Privacy Level</p>
                       <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                             doc.visibility === 'shared' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {doc.visibility === 'shared' ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                          </div>
                          <div>
                             <p className="text-sm font-black uppercase tracking-tight text-zinc-900 leading-none">{doc.visibility.replace('_', ' ')}</p>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                {doc.visibility === 'shared' ? "Visible to all parties" : "Authorised access only"}
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Assigned Entities</h3>
                       
                       <div className="space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-100"><User className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-[9px]">Linked Tenant</p>
                                <p className="text-xs font-bold text-zinc-900">{doc.tenantId?.name || "Global / Not Assigned"}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-100"><Building className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-[9px]">Property Reference</p>
                                <p className="text-xs font-bold text-zinc-900">{doc.propertyId?.propertyName || "General Archive"}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-100"><Calendar className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-[9px]">Archived Date</p>
                                <p className="text-xs font-bold text-zinc-900">{new Date(doc.createdAt).toLocaleDateString()} • {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              <div className="p-8 bg-zinc-950 text-white rounded-[3rem] shadow-2xl space-y-6 flex flex-col justify-center text-center group">
                 <Shield className="h-10 w-10 text-white/20 mx-auto group-hover:scale-110 transition-transform duration-700" />
                 <p className="text-xs font-medium text-white/50 leading-relaxed italic">
                    " All documents in the archive are encrypted and stored in alignment with residency data protection standards. "
                 </p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
