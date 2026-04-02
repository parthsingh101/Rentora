"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Save, Trash2, Plus, Zap, 
  Briefcase, Home, DollarSign, Info, AlertCircle,
  Calculator
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function EditBillPage() {
  const { id: billId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    billingMonth: "",
    billingYear: "",
    rentAmount: 0,
    electricityBill: 0,
    extraCharges: [],
    dueDate: "",
    notes: "",
    paymentStatus: ""
  });

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
        setFormData({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ""
        });
      } else {
        setError(data.message || "Failed to fetch bill");
      }
    } catch (err) {
      console.error("Error fetching bill:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExtra = () => {
    setFormData(prev => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { label: "", amount: 0 }]
    }));
  };

  const handleRemoveExtra = (index) => {
    setFormData(prev => ({
      ...prev,
      extraCharges: prev.extraCharges.filter((_, i) => i !== index)
    }));
  };

  const handleExtraChange = (index, field, value) => {
    const updated = [...formData.extraCharges];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, extraCharges: updated }));
  };

  const calculateTotal = () => {
    const extras = formData.extraCharges.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return Number(formData.rentAmount) + Number(formData.electricityBill) + extras;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess("Bill updated successfully!");
        setTimeout(() => router.push(`/landlord/billing/${billId}`), 1000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update bill");
      }
    } catch (err) {
      console.error("Error updating bill:", err);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center p-20"><div className="animate-spin h-8 w-8 border-b-2 border-zinc-900 rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href={`/landlord/billing/${billId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Invoice
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display italic underline underline-offset-8 decoration-zinc-100">Edit Invoice</h1>
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">#{billId.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Financial Editor */}
              <section className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-8">
                 <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                       <DollarSign className="h-5 w-5 text-zinc-400" />
                       Line Items
                    </h2>
                 </div>

                 {/* Rent (Editable in edit mode) */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monthly Rent (₹)</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                      value={formData.rentAmount}
                      onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                    />
                 </div>

                 {/* Electricity */}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Zap className="h-3.5 w-3.5" />
                       Utility Charge (Electricity)
                    </label>
                    <input 
                      type="number"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                      value={formData.electricityBill}
                      onChange={(e) => setFormData({...formData, electricityBill: e.target.value})}
                    />
                 </div>

                 {/* Extras */}
                 <div className="space-y-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Additional Items</p>
                       <button type="button" onClick={handleAddExtra} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">+ Add Entry</button>
                    </div>
                    <div className="space-y-3">
                       {formData.extraCharges.map((item, idx) => (
                          <div key={idx} className="flex gap-3 animate-in slide-in-from-right-4">
                             <input 
                               type="text"
                               className="flex-1 px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                               placeholder="Label"
                               value={item.label}
                               onChange={(e) => handleExtraChange(idx, 'label', e.target.value)}
                             />
                             <input 
                               type="number"
                               className="w-32 px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-zinc-900"
                               placeholder="Amount"
                               value={item.amount}
                               onChange={(e) => handleExtraChange(idx, 'amount', e.target.value)}
                             />
                             <button type="button" onClick={() => handleRemoveExtra(idx)} className="p-3 text-zinc-400 hover:text-red-500 rounded-xl transition-all">
                                <Trash2 className="h-4 w-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              </section>

              {/* Status & Dates */}
              <section className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Payment Status</label>
                    <select 
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5"
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                    >
                       <option value="pending">Pending</option>
                       <option value="paid">Paid</option>
                       <option value="overdue">Overdue</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 font-display"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                 </div>
              </section>
           </div>

           {/* Summary Sidebar */}
           <div className="space-y-6">
              <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl space-y-8 sticky top-8">
                 <div className="space-y-2 pb-6 border-b border-white/10 text-center">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Calculated Invoice Total</p>
                    <p className="text-5xl font-black italic tracking-tighter">₹{calculateTotal().toLocaleString()}</p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-start gap-4">
                       <div className="h-8 w-8 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shrink-0"><Calculator className="h-4 w-4" /></div>
                       <p className="text-xs font-medium text-white/50 leading-relaxed italic">Totals are auto-synced with the line items shown on the left before finalizing.</p>
                    </div>
                    {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-100 rounded-2xl text-[10px] font-black flex items-center gap-2 tracking-wide uppercase">{error}</div>}
                    {success && <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-100 rounded-2xl text-[10px] font-black flex items-center gap-2 tracking-wide uppercase">{success}</div>}
                    <button 
                      type="submit"
                      disabled={saving}
                      className={`w-full py-5 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        saving ? "bg-zinc-800 text-zinc-600" : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
                      }`}
                    >
                       <Save className="h-5 w-5" />
                       {saving ? "Deploying..." : "Finalize Changes"}
                    </button>
                 </div>
              </div>

              <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-[2rem] flex items-start gap-3">
                 <Info className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                 <p className="text-xs font-bold text-zinc-400 italic">Editing history is logged for transparency. Ensure you have notified the tenant of any fundamental changes to the billing amount.</p>
              </div>
           </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
