"use client";

import { useEffect, useState } from "react";
import { 
  Shield, FileText, Search, Filter, 
  Trash2, Download, Building, User, 
  Calendar, Globe, Lock, ShieldCheck,
  BarChart3, PieChart, Activity
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminDocumentsPage() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/landlord`, { // Admin can see all via this endpoint if backend allows or dedicated admin endpoint
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching admin documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.landlordId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full w-fit mb-2 animate-pulse">
                <Shield className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Global Repository Control</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Document Governance</h1>
             <p className="text-zinc-500 font-medium italic underline underline-offset-4 decoration-zinc-100">" Monitoring residency records and compliance documentation platform-wide. "</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 border border-zinc-200 rounded-[2.5rem] shadow-xl">
             <div className="bg-indigo-50 h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 font-black shadow-inner">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Compliant Records</p>
                <p className="text-xl md:text-2xl font-black text-zinc-900 tracking-tighter italic">100% SECURE</p>
             </div>
          </div>
        </div>

        {/* Global Archive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Total Docs" value={documents.length} icon={FileText} color="zinc" />
           <StatCard title="Agreements" value={documents.filter(d => d.documentType === 'agreement').length} icon={Shield} color="emerald" />
           <StatCard title="Shared Files" value={documents.filter(d => d.visibility === 'shared').length} icon={Globe} color="amber" />
           <StatCard title="Private" value={documents.filter(d => d.visibility === 'landlord_only').length} icon={Lock} color="rose" />
        </div>

        {/* Global Document Table */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
             <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
               <input
                 type="text"
                 placeholder="Search documents by title or landlord..."
                 className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-display"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button className="px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold hover:bg-zinc-100 transition-all flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Global Filters
             </button>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Document / Reference</th>
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Owned By</th>
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Visibility</th>
                       <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Type</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                      [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="px-8 py-10 bg-zinc-50/20"></td></tr>)
                    ) : filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center space-y-2">
                           <FileText className="h-10 w-10 text-zinc-200 mx-auto" />
                           <p className="text-zinc-400 font-bold italic underline underline-offset-4 decoration-zinc-100">No residency documents recorded in the platform archive.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc._id} className="hover:bg-zinc-50/50 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="space-y-0.5">
                                 <p className="font-black text-zinc-900 italic tracking-tight">{doc.title}</p>
                                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Archieved {new Date(doc.createdAt).toLocaleDateString()}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-black text-zinc-800">{doc.landlordId?.name}</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-zinc-400 leading-none">ID: {doc.landlordId?._id.slice(-6).toUpperCase()}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 {doc.visibility === 'shared' ? <Globe className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-rose-500" />}
                                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{doc.visibility.replace('_', ' ')}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 doc.documentType === 'agreement' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                              }`}>
                                 {doc.documentType}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <Link href={`/landlord/documents/${doc._id}`} className="p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all inline-block shadow-sm">
                                 <ShieldCheck className="h-4 w-4" />
                              </Link>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Global Compliance Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 px-12 bg-zinc-950 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden items-center group">
           <div className="absolute -left-10 top-0 h-full w-40 bg-white/5 pointer-events-none opacity-20" />
           <div className="space-y-4 relative z-10">
              <h3 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                 <Activity className="h-8 w-8 text-emerald-500" />
                 Platform Governance
              </h3>
              <p className="text-sm font-bold text-white/50 leading-relaxed italic underline underline-offset-8 decoration-white/10">
                 " Ensure all residency documents across the platform are compliant with local rental statutes and privacy regulations. Admin oversight is logged for audit trails. "
              </p>
           </div>
           <div className="flex flex-wrap gap-4 relative z-10 justify-end opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
              <BarChart3 className="h-20 w-20 text-white/20" />
              <PieChart className="h-20 w-20 text-white/20" />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
