"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Users, Home, Calendar, CreditCard, 
  Trash2, Plus, Info, Save, Mail, Building,
  Zap, Briefcase, DollarSign, Calculator, AlertCircle,
  FileText, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewBillPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const [formData, setFormData] = useState({
    billingMonth: new Date().toLocaleString('default', { month: 'long' }),
    billingYear: new Date().getFullYear(),
    rentAmount: 0,
    electricityBill: 0,
    extraCharges: [],
    dueDate: "",
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [session]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setAssignments(data.filter(a => a.status === 'active'));
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData(prev => ({
      ...prev,
      rentAmount: assignment.agreedMonthlyRent
    }));
    setStep(2);
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
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify({
          ...formData,
          tenantId: selectedAssignment.tenantId._id,
          propertyId: selectedAssignment.propertyId._id,
          unitId: selectedAssignment.unitId._id,
        }),
      });

      if (res.ok) {
        router.push("/landlord/billing");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to generate bill");
      }
    } catch (err) {
      console.error("Error generating bill:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/landlord/billing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Billing
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Generate Monthly Bill</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-3xl overflow-x-auto">
          {[
            { n: 1, label: "Select Tenant", icon: Users },
            { n: 2, label: "Enter Charges", icon: DollarSign },
            { n: 3, label: "Finalize", icon: Save }
          ].map((s) => (
            <div 
              key={s.n}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all ${
                step === s.n ? "bg-zinc-900 text-white shadow-xl" : 
                step > s.n ? "bg-emerald-50 text-emerald-700 font-bold" : "text-zinc-400 font-bold"
              }`}
            >
               <s.icon className={`h-4 w-4 ${step === s.n ? "animate-bounce" : ""}`} />
               <span className="text-xs uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {assignments.length === 0 ? (
               <div className="md:col-span-2 text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] space-y-4">
                  <div className="h-20 w-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto border border-zinc-100"><Users className="h-10 w-10 text-zinc-300" /></div>
                  <p className="text-zinc-500 font-bold">You don't have any active tenant assignments yet.</p>
                  <Link href="/landlord/assignments/new" className="inline-flex px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold">Assign a tenant first</Link>
               </div>
             ) : (
               assignments.map(assn => (
                 <button
                   key={assn._id}
                   onClick={() => handleSelectAssignment(assn)}
                   className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-zinc-900 text-left transition-all group"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="h-14 w-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-500">
                          {assn.tenantId?.name[0]}
                       </div>
                       <ChevronRight className="h-6 w-6 text-zinc-300 group-hover:translate-x-1 group-hover:text-zinc-900 transition-all" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-1">{assn.tenantId?.name}</h3>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">
                          <Building className="h-3 w-3" /> {assn.propertyId?.propertyName}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">
                          <Home className="h-3 w-3" /> Unit: {assn.unitId?.unitName}
                       </div>
                    </div>
                 </button>
               ))
             )}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
               {/* Period Section */}
               <section className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                     <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2 font-display">
                        <Calendar className="h-6 w-6 text-zinc-400" />
                        Billing Period
                     </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Month</label>
                        <select 
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                          value={formData.billingMonth}
                          onChange={(e) => setFormData({...formData, billingMonth: e.target.value})}
                        >
                           {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Year</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5"
                          value={formData.billingYear}
                          onChange={(e) => setFormData({...formData, billingYear: e.target.value})}
                        />
                     </div>
                  </div>
               </section>

               {/* Charges Section */}
               <section className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                     <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2 font-display">
                        <CreditCard className="h-6 w-6 text-zinc-400" />
                        Line Items
                     </h2>
                  </div>
                  
                  {/* Rent (Read-only/Auto-fill) */}
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><Home className="h-5 w-5" /></div>
                        <div>
                           <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-1">Standard Rent</p>
                           <p className="text-base font-bold text-emerald-900">Monthly Lease Rent</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-2xl font-black text-emerald-900">₹{formData.rentAmount}</span>
                     </div>
                  </div>

                  {/* Electricity */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 ml-1">
                        <div className="h-6 w-6 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500"><Zap className="h-3.5 w-3.5" /></div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Utility Charges</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4 items-center">
                        <p className="text-sm font-bold text-zinc-900 ml-1">Electricity Bill</p>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                           <input 
                             type="number"
                             placeholder="0"
                             className="w-full pl-8 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all"
                             value={formData.electricityBill}
                             onChange={(e) => setFormData({...formData, electricityBill: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Dynamic Extra Charges */}
                  <div className="space-y-4 pt-4 border-t border-zinc-100">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 ml-1">
                           <div className="h-6 w-6 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400"><Briefcase className="h-3.5 w-3.5" /></div>
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Additional Charges</p>
                        </div>
                        <button 
                          type="button"
                          onClick={handleAddExtra}
                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                        >
                          + Add Item
                        </button>
                     </div>
                     
                     <div className="space-y-3">
                        {formData.extraCharges.map((item, idx) => (
                           <div key={idx} className="flex gap-3 group">
                              <input 
                                type="text"
                                placeholder="Charge label (e.g. Water)"
                                className="flex-1 px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={item.label}
                                onChange={(e) => handleExtraChange(idx, 'label', e.target.value)}
                              />
                              <div className="relative w-32">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">₹</span>
                                 <input 
                                   type="number"
                                   className="w-full pl-6 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                   value={item.amount}
                                   onChange={(e) => handleExtraChange(idx, 'amount', e.target.value)}
                                 />
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveExtra(idx)}
                                className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
               <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] shadow-2xl space-y-8 sticky top-8">
                  <div className="space-y-1 border-b border-white/10 pb-4">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Selected Tenant</p>
                     <h3 className="text-lg font-black">{selectedAssignment?.tenantId?.name}</h3>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between text-white/60 font-bold text-sm">
                        <span>Base Rent</span>
                        <span>₹{formData.rentAmount}</span>
                     </div>
                     <div className="flex justify-between text-white/60 font-bold text-sm">
                        <span>Utilities</span>
                        <span>₹{formData.electricityBill || 0}</span>
                     </div>
                     {formData.extraCharges.length > 0 && (
                        <div className="flex justify-between text-white/60 font-bold text-sm">
                           <span>Extras</span>
                           <span>₹{formData.extraCharges.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)}</span>
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Grand Total</p>
                        <p className="text-4xl font-black">₹{calculateTotal().toLocaleString()}</p>
                     </div>
                     <Calculator className="h-8 w-8 text-white/10" />
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Due Date</label>
                        <input 
                           type="date"
                           className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:border-white transition-colors text-white"
                           value={formData.dueDate}
                           onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                           required
                        />
                     </div>
                     <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.dueDate}
                        className={`w-full py-5 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-3 transition-all active:scale-95 ${
                           loading || !formData.dueDate ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_20px_40px_-5px_rgba(255,255,255,0.2)]"
                        }`}
                     >
                        {loading ? "Generating..." : (
                          <>
                             <Save className="h-5 w-5" />
                             Deploy Invoice
                          </>
                        )}
                     </button>
                  </div>
               </div>

               <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-900/60 leading-relaxed italic">
                     Generate bills around the 1st of every month. The tenant will receive an automated notification (if configured).
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
