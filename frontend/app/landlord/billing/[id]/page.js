"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Printer, Download, Mail, Phone, 
  MapPin, Calendar, Clock, CheckCircle2, 
  AlertCircle, Receipt, Building, Home, User,
  DollarSign, Zap, Briefcase, Info, ArrowUpRight,
  ShieldCheck, Share2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function BillDetailPage() {
  const { id: billId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Proof Upload State
  const [proofFile, setProofFile] = useState(null);
  const [proofNote, setProofNote] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Review State
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    if (billId) fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBill(data);
      } else {
        console.error("Failed to fetch bill:", data.message);
      }
    } catch (error) {
      console.error("Error fetching bill detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBill();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!proofFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("proof", proofFile);
    formData.append("note", proofNote);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` },
        body: formData,
      });
      if (res.ok) {
        fetchBill();
        setProofFile(null);
        setProofNote("");
      }
    } catch (error) {
      console.error("Error uploading proof:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleReviewProof = async (status) => {
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`
        },
        body: JSON.stringify({ status, rejectionReason: reviewNote })
      });
      if (res.ok) {
        fetchBill();
        setReviewNote("");
      }
    } catch (error) {
      console.error("Error reviewing proof:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bill) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
          <h3 className="text-lg font-semibold text-zinc-900">Invoice not found</h3>
          <Link href="/landlord/billing" className="text-emerald-600 hover:underline mt-4 block font-medium">Back to Billing</Link>
        </div>
      </DashboardLayout>
    );
  }

  const isOverdue = bill.paymentStatus === 'pending' && new Date(bill.dueDate) < new Date();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
             <Link href="/landlord/billing" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
             </Link>
             <div className="flex items-center gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-display">Invoice Detail</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                   bill.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                   bill.paymentStatus === 'proof_submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                   isOverdue ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                   {bill.paymentStatus.replace('_', ' ')}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-3 bg-white border border-zinc-200 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm">
                <Printer className="h-5 w-5" />
             </button>
             <button className="px-5 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export PDF
             </button>
             {session?.user?.role === 'landlord' && bill.paymentStatus === 'pending' && (
                <button 
                  onClick={() => handleUpdateStatus('paid')}
                  disabled={updating}
                  className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                   {updating ? "Syncing..." : "Mark as Paid"}
                </button>
             )}
          </div>
        </div>

        {/* Invoice Page Container */}
        <div className="bg-white border border-zinc-200 rounded-[3rem] shadow-2xl relative overflow-hidden group">
           {/* Top Color Bar */}
           <div className={`h-3 w-full ${bill.paymentStatus === 'paid' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`} />
           
           <div className="p-12 space-y-12">
              {/* Branding and Basic Info */}
              <div className="flex flex-col md:flex-row justify-between gap-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="h-12 w-12 bg-zinc-950 text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg shadow-zinc-400/20">R</div>
                       <h2 className="text-2xl font-black text-zinc-900 tracking-tight">RENTORA</h2>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xl font-black text-zinc-900">#{bill._id.slice(-6).toUpperCase()}</p>
                       <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Invoicing Period: {bill.billingMonth} {bill.billingYear}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-12 text-right">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Issue Date</p>
                       <p className="text-sm font-bold text-zinc-900">{new Date(bill.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Due Date</p>
                       <p className={`text-sm font-black ${isOverdue ? "text-rose-600" : "text-zinc-900"}`}>{new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>

              {/* Entity Breakdown (From/To) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-t border-b border-zinc-100">
                 <div className="space-y-4">
                    <span className="px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[9px] font-black text-zinc-400 uppercase tracking-widest">Issuer (Landlord)</span>
                    <div className="space-y-2">
                       <h4 className="text-lg font-black text-zinc-900">{bill.landlordId?.name}</h4>
                       <div className="space-y-1 font-bold text-sm text-zinc-500">
                          <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {bill.landlordId?.email}</p>
                          <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {bill.landlordId?.phone}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 relative">
                    <span className="px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[9px] font-black text-zinc-400 uppercase tracking-widest">Recipient (Tenant)</span>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <h4 className="text-lg font-black text-zinc-900">{bill.tenantId?.name}</h4>
                          <div className="space-y-1 font-bold text-sm text-zinc-500">
                             <p className="flex items-center gap-2 underline decoration-zinc-100 underline-offset-4"><MapPin className="h-3 w-3" /> {bill.propertyId?.propertyName}, {bill.unitId?.unitName}</p>
                             <p className="text-zinc-400 ml-5">{bill.propertyId?.address}, {bill.propertyId?.city}</p>
                          </div>
                       </div>
                    </div>
                    <Receipt className="absolute -right-4 -top-8 h-40 w-40 text-zinc-50 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                 </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-6">
                 <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-zinc-400" />
                    Bill Breakdown
                 </h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b-2 border-zinc-900">
                             <th className="py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Description</th>
                             <th className="py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-100 font-display">
                          <tr className="bg-white hover:bg-zinc-50/50 transition-colors">
                             <td className="py-6">
                                <div className="space-y-0.5">
                                   <p className="text-sm font-black text-zinc-900">Base Monthly Rent</p>
                                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Standard lease charge for {bill.unitId?.unitName}</p>
                                </div>
                             </td>
                             <td className="py-6 text-right font-black text-zinc-900">₹{bill.rentAmount?.toLocaleString()}</td>
                          </tr>
                          {bill.electricityBill > 0 && (
                             <tr className="bg-white hover:bg-zinc-50/50 transition-colors">
                                <td className="py-6">
                                   <div className="space-y-0.5">
                                      <p className="text-sm font-black text-zinc-900">Electricity & Utilities</p>
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Utility charges for the billing cycle</p>
                                   </div>
                                </td>
                                <td className="py-6 text-right font-black text-zinc-900">₹{bill.electricityBill?.toLocaleString()}</td>
                             </tr>
                          )}
                          {bill.extraCharges && bill.extraCharges.map((charge, i) => (
                             <tr key={i} className="bg-white hover:bg-zinc-50/50 transition-colors">
                                <td className="py-6">
                                   <div className="space-y-0.5">
                                      <p className="text-sm font-black text-zinc-900">{charge.label}</p>
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Additional maintenance / service item</p>
                                   </div>
                                </td>
                                <td className="py-6 text-right font-black text-zinc-900">₹{charge.amount?.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Total Calculation Section */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-8">
                 <div className="flex-1 space-y-4 max-w-sm">
                    <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 italic font-medium text-xs text-zinc-500 leading-relaxed">
                       " {bill.notes || "No additional notes provided for this billing cycle. Please ensure payment is made before the due date to avoid late fees." } "
                    </div>
                    
                    {bill.rejectionReason && (
                       <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 text-[10px] font-black uppercase tracking-widest flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Rejected: {bill.rejectionReason}</span>
                       </div>
                    )}

                    {bill.paymentStatus === 'paid' && (
                       <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-500">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-black uppercase tracking-widest">Payment Cleared Successfully</span>
                       </div>
                    )}

                    {bill.paymentStatus === 'proof_submitted' && (
                       <div className="flex items-center gap-3 px-6 py-4 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 animate-in slide-in-from-left-4 duration-500">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm font-black uppercase tracking-widest">Proof Submitted - Under Review</span>
                       </div>
                    )}
                 </div>

                 <div className="w-full md:w-80 space-y-4">
                    <div className="flex justify-between items-center text-zinc-500 font-bold text-sm">
                       <span>Total Items (Subtotal)</span>
                       <span>₹{bill.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-500 font-bold text-sm">
                       <span>Taxes & HST</span>
                       <span>₹0.00</span>
                    </div>
                    <div className="pt-6 border-t-4 border-zinc-900 flex justify-between items-center">
                       <span className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Amount Due</span>
                       <span className="text-4xl font-black text-zinc-950 font-display tracking-tight">₹{bill.totalAmount.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="pt-12 text-center space-y-2 border-t border-zinc-100">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Integrated Property Invoicing Platform</p>
                 <p className="text-xs font-bold text-zinc-950">Managed by {bill.landlordId?.name} via Rentora.io</p>
              </div>
           </div>

           {/* Watermark/Background Decor */}
           <div className="absolute left-0 bottom-0 px-12 py-8 pointer-events-none opacity-[0.03] select-none">
              <h1 className="text-[10vw] font-black tracking-tighter italic">RENTORA</h1>
           </div>
        </div>

        {/* --- DYNAMIC ACTION TERMINAL --- */}

        {/* 1. TENANT UPLOAD SECTION */}
        {session?.user?.role === 'tenant' && (bill.paymentStatus === 'pending' || bill.paymentStatus === 'overdue') && (
           <div className="p-10 bg-white border border-zinc-200 rounded-[3rem] shadow-xl space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
                 <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100"><ArrowUpRight className="h-6 w-6" /></div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-zinc-900">Submit Payment Proof</h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Upload your bank receipt or transaction screenshot</p>
                 </div>
              </div>
              
              <form onSubmit={handleUploadProof} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Attachment (Image/PDF)</label>
                    <div className="relative group">
                       <input 
                          type="file" 
                          accept="image/*,.pdf"
                          onChange={(e) => setProofFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          required
                       />
                       <div className="px-6 py-10 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 group-hover:border-zinc-900 transition-all text-center">
                          <Download className="h-8 w-8 text-zinc-300" />
                          <p className="text-xs font-bold text-zinc-600">{proofFile ? proofFile.name : "Click or drag your receipt here"}</p>
                          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">Max 5MB • JPEG/PNG/PDF</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Transaction Note (Optional)</label>
                       <textarea 
                          placeholder="e.g. Paid via GPay / Reference ID: 9283..."
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 min-h-[120px]"
                          value={proofNote}
                          onChange={(e) => setProofNote(e.target.value)}
                       />
                    </div>
                    <button 
                       type="submit"
                       disabled={uploading || !proofFile}
                       className={`w-full py-5 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 ${
                          uploading ? "bg-zinc-800 text-white/50" : "bg-zinc-950 text-white shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20"
                       }`}
                    >
                       <ShieldCheck className="h-5 w-5" />
                       {uploading ? "Uploading..." : "Publish Payment Proof"}
                    </button>
                 </div>
              </form>
           </div>
        )}

        {/* 2. LANDLORD REVIEW TERMINAL */}
        {session?.user?.role === 'landlord' && bill.paymentStatus === 'proof_submitted' && (
           <div className="p-10 bg-white border-4 border-indigo-500/10 rounded-[3rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-1000 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 opacity-5"><Activity className="h-40 w-40" /></div>
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="h-10 w-10 bg-indigo-500 text-white rounded-xl shadow-lg flex items-center justify-center"><CheckCircle2 className="h-5 w-5" /></div>
                 <div>
                    <h3 className="text-xl font-black text-zinc-900 italic">Proof Review Terminal</h3>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Inspecting Submitted Evidence</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Submitted Attachment</p>
                    <div className="rounded-[2rem] overflow-hidden border border-zinc-100 bg-zinc-50 shadow-inner group">
                       {bill.paymentProofUrl?.endsWith('.pdf') ? (
                          <div className="p-20 text-center space-y-4">
                             <FileText className="h-12 w-12 text-zinc-200 mx-auto" />
                             <p className="text-xs font-bold text-zinc-400 italic font-display underline underline-offset-4 decoration-zinc-100">PDF Invoicing Proof</p>
                             <a href={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${bill.paymentProofUrl}`} target="_blank" className="inline-block px-6 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Open PDF</a>
                          </div>
                       ) : (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${bill.paymentProofUrl}`} 
                            alt="Payment Proof" 
                            className="w-full h-auto object-cover hover:scale-110 transition-transform duration-1000 cursor-zoom-in"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${bill.paymentProofUrl}`, '_blank')}
                          />
                       )}
                    </div>
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest text-center">Click to view full resolution</p>
                 </div>

                 <div className="flex flex-col justify-between">
                    <div className="space-y-6">
                       <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Tenant's Note</p>
                          <p className="text-sm font-bold text-zinc-950 italic">" {bill.paymentProofNote || "No note provided."} "</p>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Rejection Reason (Optional)</label>
                          <textarea 
                             placeholder="If rejecting, tell the tenant why..."
                             className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-rose-500/5 min-h-[100px]"
                             value={reviewNote}
                             onChange={(e) => setReviewNote(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                       <button 
                          onClick={() => handleReviewProof('rejected')}
                          disabled={updating}
                          className="py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 border border-zinc-200"
                       >
                          Reject Proof
                       </button>
                       <button 
                          onClick={() => handleReviewProof('paid')}
                          disabled={updating}
                          className="py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                       >
                          Approve Payment
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Sidebar help */}
        <div className="flex flex-col md:flex-row gap-6 p-8 bg-zinc-900 text-white rounded-[3rem] items-center justify-between shadow-xl">
           <div className="space-y-2">
              <h4 className="text-lg font-bold flex items-center gap-2">
                 <ShieldCheck className="h-6 w-6 text-emerald-500" />
                 Secure Payment History
              </h4>
              <p className="text-xs font-medium text-white/50 leading-relaxed max-w-md">
                 Once the payment is confirmed, the status is locked to ensure financial integrity. An automated digital receipt is shared with the tenant immediately.
              </p>
           </div>
           {bill.paymentStatus === 'pending' ? (
              <button className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-lg active:scale-95 flex items-center gap-2 group">
                 Share Invoice URL
                 <Share2 className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
           ) : (
              <button className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                 View Digital Receipt
                 <ArrowUpRight className="h-4 w-4" />
              </button>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
