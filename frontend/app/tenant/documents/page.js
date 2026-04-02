"use client";

import { useEffect, useState } from "react";
import { 
  FileText, Download, Search, Filter, 
  FolderLock, ShieldCheck, Calendar, 
  User, Building, ExternalLink, Globe,
  Shield, Info, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function TenantDocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [session]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/tenant`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching tenant documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">My Residency Archive</h1>
             <p className="text-zinc-500 font-medium">Access your lease agreements, receipts, and official notices.</p>
          </div>
          <div className="px-6 py-4 bg-zinc-950 text-white rounded-[2rem] shadow-2xl flex items-center gap-4 group">
             <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                <ShieldCheck className="h-5 w-5 text-emerald-400 font-black" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Security Status</p>
                <p className="text-sm font-bold uppercase tracking-tight">Verified Archive</p>
             </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Total Files" value={documents.length} icon={FileText} color="zinc" />
           <StatCard title="Agreements" value={documents.filter(d => d.documentType === 'agreement').length} icon={Shield} color="emerald" />
           <StatCard title="Receipts" value={documents.filter(d => d.documentType === 'receipt').length} icon={ShieldCheck} color="indigo" />
           <StatCard title="Alerts" value={documents.filter(d => d.documentType === 'notice').length} icon={AlertCircle} color="rose" />
        </div>

        {/* Filters */}
        <div className="relative max-w-2xl">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
           <input
             type="text"
             placeholder="Search your documents..."
             className="w-full pl-12 pr-6 py-5 bg-white border border-zinc-200 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 shadow-sm transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        {/* Document Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-100 rounded-[3rem] border border-zinc-200" />)}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] space-y-4">
             <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-zinc-200 border border-zinc-100"><FolderLock className="h-8 w-8" /></div>
             <p className="text-zinc-500 font-bold italic underline-offset-4 decoration-zinc-100 underline">No residency documents are currently shared with you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDocs.map((doc) => (
              <Link 
                key={doc._id} 
                href={`/landlord/documents/${doc._id}`}
                className="group p-8 bg-white border border-zinc-200 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                <div className="absolute right-0 top-0 p-8 opacity-5"><FileText className="h-20 w-20" /></div>
                
                <div className="space-y-6 relative z-10">
                   <div className="flex justify-between items-start">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                         doc.documentType === 'agreement' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                      }`}>
                         {doc.documentType}
                      </div>
                      <Globe className="h-4 w-4 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                   </div>

                   <div className="space-y-1">
                      <h3 className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors line-clamp-1">{doc.title}</h3>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Shared {new Date(doc.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-50 relative z-10">
                   <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-zinc-300" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase italic">{doc.propertyId?.propertyName || "Residency Archive"}</span>
                   </div>
                   <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm">
                      <Download className="h-4 w-4" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Security Footer */}
        <div className="p-10 bg-zinc-50 border border-zinc-200 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-white rounded-[1.5rem] border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors"><Shield className="h-8 w-8" /></div>
              <div className="space-y-1">
                 <h4 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">Document Certification</h4>
                 <p className="text-xs font-bold text-zinc-400 italic max-w-sm">" Your residency documents are professionally verified and securely hosted. Please maintain local copies for your offline records. "</p>
              </div>
           </div>
           <button className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-zinc-800 active:scale-95 transition-all">Support Center</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
