"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Users, Mail, Phone, Home, 
  Calendar, CreditCard, Clock, CheckCircle2, 
  MapPin, Building2, Package, Tag, ArrowRight,
  ShieldCheck, AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function TenantDetailPage() {
  const { id: tenantId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vacating, setVacating] = useState(false);

  useEffect(() => {
    if (tenantId) fetchTenant();
  }, [tenantId]);

  const fetchTenant = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTenantData(data);
      } else {
        console.error("Failed to fetch tenant:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tenant detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVacate = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to mark this tenant as vacated? This will free up the unit for new assignments.")) return;

    setVacating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/${assignmentId}/vacate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session?.user?.token || ""}` }
      });

      if (res.ok) {
        fetchTenant();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to vacate tenant");
      }
    } catch (error) {
      console.error("Error vacating tenant:", error);
    } finally {
      setVacating(false);
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

  if (!tenantData) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
          <h3 className="text-lg font-semibold text-zinc-900">Tenant not found</h3>
          <Link href="/landlord/tenants" className="text-emerald-600 hover:underline mt-4 block font-medium">Back to Tenants</Link>
        </div>
      </DashboardLayout>
    );
  }

  const { tenant, assignments } = tenantData;
  const activeAssignment = assignments.find(a => a.status === 'active');
  const pastAssignments = assignments.filter(a => a.status === 'vacated');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
           <div className="space-y-4">
              <Link href="/landlord/tenants" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Back to Tenants
              </Link>
              <div className="flex items-center gap-6">
                 <div className="h-24 w-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl">
                    {tenant.name[0]}
                 </div>
                 <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 font-display">{tenant.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-500 font-medium text-sm">
                       <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {tenant.email}</span>
                       <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {tenant.phone || "No phone provided"}</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm">
                 Edit Profile
              </button>
              <Link href="/landlord/notices/new" className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md">
                 Send Notice
              </Link>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Active Lease Section */}
              <section className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm shadow-zinc-200/50">
                 <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck className="h-5 w-5 text-emerald-500" />
                       Active Lease
                    </h2>
                    {activeAssignment && (
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {activeAssignment.status}
                       </span>
                    )}
                 </div>
                 
                 <div className="p-8">
                    {activeAssignment ? (
                       <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Residence</p>
                                <div className="space-y-1">
                                   <h3 className="text-xl font-extrabold text-zinc-900">{activeAssignment.propertyId?.propertyName}</h3>
                                   <p className="text-sm font-bold text-zinc-600 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {activeAssignment.propertyId?.address}</p>
                                </div>
                                <div className="pt-4 flex items-center justify-between border-t border-zinc-200/50">
                                   <div className="space-y-0.5">
                                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Unit</p>
                                      <p className="text-sm font-black text-zinc-900">{activeAssignment.unitId?.unitName}</p>
                                   </div>
                                   <Link href={`/landlord/units/${activeAssignment.unitId?._id}`} className="text-xs font-bold text-emerald-600 hover:underline">View Unit →</Link>
                                </div>
                             </div>

                             <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Financials</p>
                                <div className="space-y-4">
                                   <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-zinc-500">Monthly Rent</span>
                                      <span className="text-xl font-black text-zinc-900">₹{activeAssignment.agreedMonthlyRent?.toLocaleString()}</span>
                                   </div>
                                   <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-zinc-500">Deposit Paid</span>
                                      <span className="text-lg font-black text-zinc-900">₹{activeAssignment.securityDeposit?.toLocaleString()}</span>
                                   </div>
                                </div>
                                <div className="pt-4 flex items-center gap-2 border-t border-zinc-200/50">
                                   <Clock className="h-3.5 w-3.5 text-zinc-400" />
                                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Billing cycle: 1st of every month</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-6 p-6 border-2 border-zinc-100 rounded-3xl">
                             <div className="flex-1 space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lease Duration</p>
                                <p className="text-sm font-bold text-zinc-900">
                                   {new Date(activeAssignment.leaseStartDate).toLocaleDateString()} — {new Date(activeAssignment.leaseEndDate).toLocaleDateString()}
                                </p>
                             </div>
                             <div className="flex-1 space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Move-in Date</p>
                                <p className="text-sm font-bold text-zinc-900">{new Date(activeAssignment.moveInDate).toLocaleDateString()}</p>
                             </div>
                             <button
                               onClick={() => handleVacate(activeAssignment._id)}
                               disabled={vacating}
                               className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                             >
                               {vacating ? "Processing..." : "End Assignment"}
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="text-center py-10 bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-100">
                          <p className="text-zinc-500 font-medium mb-4">No active lease for this tenant.</p>
                          <Link href="/landlord/assignments/new" className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-zinc-800 transition-all">
                             Assign a unit now <ArrowRight className="h-4 w-4" />
                          </Link>
                       </div>
                    )}
                 </div>
              </section>

              {/* Past Assignments History */}
              {pastAssignments.length > 0 && (
                <section className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                   <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                      <h2 className="text-lg font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                         <Clock className="h-5 w-5 text-zinc-400" />
                         Lease History
                      </h2>
                   </div>
                   <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                               <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Property & Unit</th>
                               <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dates</th>
                               <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Monthly Rent</th>
                               <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100">
                            {pastAssignments.map(past => (
                               <tr key={past._id} className="hover:bg-zinc-50 transition-colors">
                                  <td className="px-8 py-5">
                                     <div className="font-bold text-zinc-900">{past.propertyId?.propertyName}</div>
                                     <div className="text-xs font-semibold text-zinc-400">{past.unitId?.unitName}</div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <div className="text-xs font-bold text-zinc-700">
                                        {new Date(past.leaseStartDate).toLocaleDateString()} — {new Date(past.leaseEndDate).toLocaleDateString()}
                                     </div>
                                  </td>
                                  <td className="px-8 py-5 text-sm font-black text-zinc-900">₹{past.agreedMonthlyRent?.toLocaleString()}</td>
                                  <td className="px-8 py-5 text-right">
                                     <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[9px] font-black uppercase tracking-widest">Vacated</span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </section>
              )}
           </div>

           {/* Sidebar Info */}
           <div className="space-y-8">
              {/* Financial Summary */}
              <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/5 rounded-full blur-3xl" />
                 <h3 className="text-lg font-black uppercase tracking-widest border-b border-white/10 pb-4">Recent Invoices</h3>
                 <div className="space-y-6">
                    <div className="p-5 bg-white/10 rounded-3xl border border-white/10 text-center">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Outstanding Balance</p>
                       <p className="text-3xl font-black text-white">₹0</p>
                    </div>
                    <div className="text-center py-6 border-t border-white/10">
                       <p className="text-xs font-bold text-zinc-500 italic">No pending bills for {tenant.name}</p>
                    </div>
                    <button className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-lg active:scale-95">
                       Generate New Bill
                    </button>
                 </div>
              </div>

              {/* Documents & Notices */}
              <section className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                       <Package className="h-4 w-4 text-zinc-400" />
                       Quick Files
                    </h2>
                 </div>
                 <div className="p-4 space-y-2">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all group font-bold text-sm text-zinc-600">
                       Lease Agreement
                       <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all group font-bold text-sm text-zinc-600">
                       KYC Documents
                       <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all group font-bold text-sm text-zinc-600">
                       Termination Notice
                       <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                 </div>
              </section>

              {/* Maintenance Issues */}
              <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4">
                 <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
                 <div>
                    <p className="text-sm font-bold text-red-900">No Open Issues</p>
                    <p className="text-[10px] font-black text-red-700/60 uppercase tracking-widest mt-0.5">Everything is clear</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
