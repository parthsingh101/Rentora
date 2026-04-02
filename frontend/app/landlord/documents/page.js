"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, Plus, Search, Filter, Folder,
  FileCheck, FileWarning, Eye, Download, 
  Trash2, Building, User, Calendar,
  MoreVertical, Share2, Shield, Lock, Globe
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";

export default function LandlordDocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, [session]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/landlord`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      if (res.ok) fetchDocuments();
    } catch (error) {
       console.error("Error deleting document:", error);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (typeFilter === "all") return matchesSearch;
    return matchesSearch && doc.documentType === typeFilter;
  });

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'shared': return <Globe className="h-3 w-3 text-emerald-500" />;
      case 'tenant': return <User className="h-3 w-3 text-indigo-500" />;
      case 'landlord_only': return <Lock className="h-3 w-3 text-rose-500" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Digital Archive</h1>
            <p className="text-zinc-500 font-medium">Manage lease agreements, IDs, and property notices.</p>
          </div>
          <Link
            href="/landlord/documents/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Upload Document
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Files" value={documents.length} icon={Folder} color="zinc" />
          <StatCard title="Agreements" value={documents.filter(d => d.documentType === 'agreement').length} icon={FileCheck} color="emerald" />
          <StatCard title="ID Proofs" value={documents.filter(d => d.documentType === 'id_proof').length} icon={Shield} color="indigo" />
          <StatCard title="Shared" value={documents.filter(d => d.visibility === 'shared').length} icon={Share2} color="amber" />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-zinc-200 rounded-[2rem] shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by document title..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="agreement">Agreement</option>
              <option value="id_proof">ID Proof</option>
              <option value="receipt">Receipt</option>
              <option value="notice">Notice</option>
              <option value="other">Other</option>
            </select>
            <button className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-zinc-100 transition-colors">
              <Filter className="h-5 w-5 text-zinc-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-zinc-100 rounded-[2.5rem] border border-zinc-200" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-24 bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] space-y-6">
            <div className="bg-zinc-50 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto border border-zinc-100">
               <FileText className="h-12 w-12 text-zinc-300" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-zinc-900 font-display tracking-tight">No file records</h3>
               <p className="text-zinc-500 max-w-sm mx-auto font-medium italic underline underline-offset-4 decoration-zinc-100">Maintain an organized digital vault for all your property-related paperwork.</p>
            </div>
            <Link href="/landlord/documents/new" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all">
               Begin Archive
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div key={doc._id} className="group p-8 bg-white border border-zinc-200 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-zinc-300 transition-all relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                {/* Visual Type Indicator */}
                <div className="absolute -right-6 -top-6 h-32 w-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-1000 select-none pointer-events-none flex items-center justify-center pt-8 pr-8">
                   <FileText className="h-12 w-12 text-zinc-200 opacity-50" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                       doc.documentType === 'agreement' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                       doc.documentType === 'notice' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                    }`}>
                      {doc.documentType.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-1">
                       {getVisibilityIcon(doc.visibility)}
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{doc.visibility.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-zinc-900 line-clamp-2 tracking-tight leading-tight group-hover:text-zinc-700 transition-colors">{doc.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                       {doc.propertyId && <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {doc.propertyId.propertyName}</p>}
                       {doc.tenantId && <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1"><User className="h-3.5 w-3.5" /> {doc.tenantId.name}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-zinc-50 relative z-10">
                  <div className="flex items-center gap-3">
                     <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Added {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Link 
                       href={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${doc.fileUrl}`} 
                       target="_blank"
                       className="p-3 bg-zinc-50 text-zinc-900 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm border border-zinc-100"
                     >
                       <Download className="h-5 w-5" />
                     </Link>
                     <button 
                       onClick={() => handleDelete(doc._id)}
                       className="p-3 bg-zinc-50 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                     >
                       <Trash2 className="h-5 w-5" />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
