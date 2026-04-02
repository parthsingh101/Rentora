"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, Edit, Trash2, Home, Package, Info, 
  CreditCard, User, Calendar, CheckCircle2, XCircle, 
  Settings, Clock, ArrowRight, ShieldCheck, Tag
} from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function UnitDetailPage() {
  const { id: unitId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (unitId) fetchUnit();
  }, [unitId]);

  const fetchUnit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUnit(data);
      } else {
        console.error("Failed to fetch unit:", data.message);
      }
    } catch (error) {
      console.error("Error fetching unit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this unit? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
      });

      if (res.ok) {
        router.push(`/landlord/properties/${unit.propertyId._id}/units`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete unit");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      alert("An error occurred while deleting");
    } finally {
      setDeleting(false);
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

  if (!unit) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
          <h3 className="text-lg font-semibold text-zinc-900">Unit not found</h3>
          <Link href="/landlord/properties" className="text-emerald-600 hover:underline mt-4 block font-medium">Back to Properties</Link>
        </div>
      </DashboardLayout>
    );
  }

  const statusColor = {
    vacant: "bg-emerald-50 text-emerald-700 border-emerald-100",
    occupied: "bg-blue-50 text-blue-700 border-blue-100",
    maintenance: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-8">
          <div className="space-y-4">
            <Link
              href={`/landlord/properties/${unit.propertyId?._id}/units`}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to units
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">{unit.unitName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor[unit.occupancyStatus]}`}>
                  {unit.occupancyStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 font-medium">
                <Home className="h-4 w-4" />
                <span>{unit.propertyId?.propertyName}</span>
                <span className="text-zinc-300">•</span>
                <span>{unit.propertyId?.city}, {unit.propertyId?.state}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
              title="Delete Unit"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <Link
              href={`/landlord/units/${unit._id}/edit`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md active:scale-95"
            >
              <Edit className="h-4 w-4" />
              Edit Unit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <section className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Info className="h-5 w-5 text-zinc-400" />
                  Overview
                </h2>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Details</span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Monthly Rent</label>
                  <p className="text-2xl font-black text-zinc-900">₹{unit.monthlyRent?.toLocaleString()}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Security Deposit</label>
                  <p className="text-2xl font-black text-zinc-900">₹{unit.securityDeposit?.toLocaleString()}</p>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Notes</label>
                  <p className="text-zinc-600 leading-relaxed font-medium bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                    {unit.notes || "No additional notes provided for this unit."}
                  </p>
                </div>
              </div>
            </section>

            {/* Appliance Inventory */}
            <section className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-zinc-400" />
                  Appliance Inventory
                </h2>
                <div className="flex items-center gap-2">
                   <Clock className="h-4 w-4 text-zinc-400" />
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Last Updated {new Date(unit.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="p-6">
                {unit.applianceInventory?.length === 0 ? (
                  <div className="text-center py-8 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                    <p className="text-sm text-zinc-500 font-medium">No appliances recorded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unit.applianceInventory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:border-zinc-300 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                            <Tag className="h-5 w-5 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900">{item.name}</p>
                            <p className="text-xs text-zinc-400 font-bold uppercase">{item.category}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'Working' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Quick Actions / Status Card */}
            <div className="p-6 bg-zinc-900 text-white rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-zinc-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-semibold group">
                   Add Maintenance Task
                   <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-semibold group">
                   Create Notice
                   <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-semibold group border-2 border-white/20">
                   Generate Bill
                   <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Tenant Status */}
            <section className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-zinc-400" />
                  Tenant Info
                </h2>
              </div>
              <div className="p-6 text-center space-y-4">
                {unit.occupancyStatus === 'vacant' ? (
                  <>
                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">Unit is Vacant</p>
                      <p className="text-sm text-zinc-500 mt-1">Ready for a new assignment.</p>
                    </div>
                    <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:underline">
                      Assign a Tenant <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">Assigned Tenant</p>
                      <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-black text-xs">View Current Agreement</p>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
