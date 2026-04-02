"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, Home, User, Calendar, CreditCard, 
  Search, CheckCircle2, ChevronRight, Save, Info,
  Search as SearchIcon, Mail, Phone, MapPin, Building2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);

  // Selection state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Form state
  const [leaseData, setLeaseData] = useState({
    leaseStartDate: "",
    leaseEndDate: "",
    moveInDate: "",
    agreedMonthlyRent: "",
    securityDeposit: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`);
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const fetchUnits = async (propId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/property/${propId}`);
      const data = await res.json();
      // Filter only vacant units
      setUnits(data.filter(u => u.occupancyStatus === 'vacant'));
    } catch (err) {
      console.error("Error fetching units:", err);
    }
  };

  const handleSearchTenant = async () => {
    if (!searchEmail) return;
    setSearching(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/search?email=${searchEmail}`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error("Error searching tenants:", err);
    } finally {
      setSearching(false);
    }
  };

  const handlePropertySelect = (prop) => {
    setSelectedProperty(prop);
    fetchUnits(prop._id);
    setStep(2);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setLeaseData(prev => ({
      ...prev,
      agreedMonthlyRent: unit.monthlyRent,
      securityDeposit: unit.securityDeposit
    }));
    setStep(3);
  };

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    setStep(4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify({
          ...leaseData,
          tenantId: selectedTenant._id,
          propertyId: selectedProperty._id,
          unitId: selectedUnit._id,
        }),
      });

      if (res.ok) {
        router.push("/landlord/tenants");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create assignment");
      }
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header and Breadcrumbs */}
        <div className="space-y-4">
           <Link href="/landlord/tenants" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Tenants
           </Link>
           <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">Assign a New Tenant</h1>
        </div>

        {/* Stepper UI */}
        <div className="flex items-center gap-2 p-1 bg-zinc-50 border border-zinc-200 rounded-2xl md:grid md:grid-cols-4 md:p-2 overflow-x-auto whitespace-nowrap">
          {[
            { n: 1, label: "Property", icon: Building2 },
            { n: 2, label: "Unit", icon: Home },
            { n: 3, label: "Tenant", icon: User },
            { n: 4, label: "Lease Details", icon: Calendar }
          ].map((s) => (
            <div 
              key={s.n}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                step === s.n ? "bg-zinc-900 text-white shadow-lg" : 
                step > s.n ? "bg-emerald-50 text-emerald-700 font-bold" : "text-zinc-400 font-medium"
              }`}
            >
               <s.icon className={`h-4 w-4 ${step === s.n ? "animate-bounce" : ""}`} />
               <span className="text-xs uppercase tracking-[0.1em]">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {/* Step 1: Select Property */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {properties.length === 0 ? (
                 <div className="md:col-span-2 text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
                    <p className="text-zinc-500 font-medium">No properties found. Create a property first.</p>
                 </div>
               ) : properties.map(prop => (
                 <button
                   key={prop._id}
                   onClick={() => handlePropertySelect(prop)}
                   className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-zinc-900 text-left transition-all group"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                          <Building2 className="h-6 w-6" />
                       </div>
                       <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-900" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">{prop.propertyName}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-black uppercase tracking-widest leading-none">
                       <MapPin className="h-3 w-3" />
                       {prop.city}, {prop.state}
                    </div>
                 </button>
               ))}
            </div>
          )}

          {/* Step 2: Select Unit */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2 underline underline-offset-8 decoration-emerald-200">
                    Units in {selectedProperty?.propertyName}
                  </h2>
                  <button onClick={() => setStep(1)} className="text-xs font-black text-zinc-400 uppercase hover:text-zinc-900 transition-colors">← Change building</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {units.length === 0 ? (
                    <div className="sm:col-span-2 md:col-span-3 text-center py-20 bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-3xl">
                       <p className="text-emerald-800 font-bold">No vacant units available in this property.</p>
                    </div>
                  ) : units.map(unit => (
                    <button
                      key={unit._id}
                      onClick={() => handleUnitSelect(unit)}
                      className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-zinc-900 text-left transition-all group"
                    >
                       <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Home className="h-5 w-5" />
                       </div>
                       <h4 className="text-base font-bold text-zinc-900">{unit.unitName}</h4>
                       <p className="text-xs font-semibold text-zinc-400 mt-1">₹{unit.monthlyRent?.toLocaleString()} / mo</p>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Step 3: Select Tenant */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
               <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-zinc-900">Find Tenant</h2>
                  <p className="text-zinc-500 font-medium">Search for an existing tenant account or <Link href="/landlord/tenants/new" className="text-zinc-900 underline font-bold">create a new one</Link>.</p>
               </div>
               
               <div className="relative group">
                  <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter tenant's email address..."
                    className="w-full pl-14 pr-6 py-5 bg-white border border-zinc-200 rounded-[2rem] text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-900 transition-all"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTenant()}
                  />
                  <button 
                    onClick={handleSearchTenant}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
               </div>

               <div className="grid gap-4 mt-6">
                  {tenants.map(tenant => (
                    <button
                      key={tenant._id}
                      onClick={() => handleTenantSelect(tenant)}
                      className="p-5 bg-white border border-zinc-200 rounded-[1.5rem] shadow-sm hover:border-zinc-900 flex items-center justify-between group transition-all"
                    >
                       <div className="flex items-center gap-4 text-left">
                          <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center font-bold text-zinc-900 border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                             {tenant.name[0]}
                          </div>
                          <div>
                             <h5 className="font-bold text-zinc-900">{tenant.name}</h5>
                             <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {tenant.email}</span>
                             </div>
                          </div>
                       </div>
                       <div className="h-8 w-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-all">
                          <CheckCircle2 className="h-4 w-4 text-zinc-200 group-hover:text-white" />
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Step 4: Finalize Lease */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="lg:col-span-2 space-y-6">
                  <section className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-8">
                     <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                        <Calendar className="h-6 w-6 text-zinc-900" />
                        <h2 className="text-xl font-bold text-zinc-900 font-display">Lease Information</h2>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Lease Start Date</label>
                           <input
                             type="date"
                             className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-display"
                             value={leaseData.leaseStartDate}
                             onChange={(e) => setLeaseData({...leaseData, leaseStartDate: e.target.value})}
                             required
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Lease End Date</label>
                           <input
                             type="date"
                             className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-display"
                             value={leaseData.leaseEndDate}
                             onChange={(e) => setLeaseData({...leaseData, leaseEndDate: e.target.value})}
                             required
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Actual Move-in Date</label>
                        <input
                          type="date"
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-display"
                          value={leaseData.moveInDate}
                          onChange={(e) => setLeaseData({...leaseData, moveInDate: e.target.value})}
                          required
                        />
                     </div>
                  </section>

                  <section className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-8">
                     <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                        <CreditCard className="h-6 w-6 text-zinc-900" />
                        <h2 className="text-xl font-bold text-zinc-900 font-display">Financial Terms</h2>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Agreed Monthly Rent (₹)</label>
                           <input
                             type="number"
                             className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                             value={leaseData.agreedMonthlyRent}
                             onChange={(e) => setLeaseData({...leaseData, agreedMonthlyRent: e.target.value})}
                             required
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Security Deposit (₹)</label>
                           <input
                             type="number"
                             className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                             value={leaseData.securityDeposit}
                             onChange={(e) => setLeaseData({...leaseData, securityDeposit: e.target.value})}
                             required
                           />
                        </div>
                     </div>
                  </section>
               </div>

               {/* Summary Sidebar */}
               <div className="space-y-6">
                  <div className="p-6 bg-zinc-900 text-white rounded-[2rem] shadow-xl space-y-6 sticky top-8">
                     <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-4">Assignment Summary</h3>
                     
                     <div className="space-y-4">
                        <div className="flex items-start gap-3">
                           <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><Building2 className="h-4 w-4" /></div>
                           <div>
                              <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest leading-none mb-1">Property</p>
                              <p className="text-sm font-bold line-clamp-1">{selectedProperty?.propertyName}</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-3">
                           <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><Home className="h-4 w-4" /></div>
                           <div>
                              <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest leading-none mb-1">Unit</p>
                              <p className="text-sm font-bold">{selectedUnit?.unitName}</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-3">
                           <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><User className="h-4 w-4" /></div>
                           <div>
                              <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest leading-none mb-1">Tenant</p>
                              <p className="text-sm font-bold truncate max-w-[150px]">{selectedTenant?.name}</p>
                           </div>
                        </div>
                     </div>

                     {error && (
                       <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-100 rounded-2xl text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                       </div>
                     )}

                     <button
                       onClick={handleSubmit}
                       disabled={loading}
                       className={`w-full py-5 rounded-2xl font-black text-black bg-white hover:bg-zinc-100 transition-all active:scale-95 flex items-center justify-center gap-3 ${
                         loading ? "opacity-50 cursor-not-allowed" : "shadow-[0_15px_30px_-10px_rgba(255,255,255,0.3)]"
                       }`}
                     >
                       {loading ? "Assigning..." : (
                         <>
                           <Save className="h-5 w-5" />
                           Finalize Lease
                         </>
                       )}
                     </button>
                  </div>

                  <div className="p-6 bg-white border border-zinc-200 rounded-[2rem] flex items-start gap-3 shadow-sm">
                     <Info className="h-5 w-5 text-zinc-400 mt-1 shrink-0" />
                     <p className="text-xs text-zinc-500 leading-relaxed font-bold">
                        Upon finalizing, the unit status will be set to **Occupied** and the tenant will receive access to their dashboard.
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
