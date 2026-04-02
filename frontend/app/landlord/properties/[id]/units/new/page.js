"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, Plus, Home, Info, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ApplianceInventoryForm from "@/components/units/ApplianceInventoryForm";

export default function CreateUnitPage() {
  const { id: propertyId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    unitName: "",
    monthlyRent: "",
    securityDeposit: "",
    occupancyStatus: "vacant",
    notes: "",
  });

  const [inventory, setInventory] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`, // Adapt based on actual token storage
        },
        body: JSON.stringify({
          ...formData,
          propertyId,
          applianceInventory: inventory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Unit created successfully!");
        setTimeout(() => {
          router.push(`/landlord/properties/${propertyId}/units`);
        }, 1500);
      } else {
        setError(data.message || "Failed to create unit");
      }
    } catch (err) {
      console.error("Error creating unit:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/landlord/properties/${propertyId}/units`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Units
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Add New Unit</h1>
            <p className="text-zinc-500">Configure a new rental unit for your property.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Core Info */}
            <div className="lg:col-span-2 space-y-6">
              <section className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-100">
                  <Info className="h-5 w-5 text-zinc-400" />
                  <h2 className="text-lg font-semibold text-zinc-900">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Unit Name / Number</label>
                    <input
                      type="text"
                      name="unitName"
                      value={formData.unitName}
                      onChange={handleChange}
                      placeholder="e.g. Apartment A-101"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Occupancy Status</label>
                    <select
                      name="occupancyStatus"
                      value={formData.occupancyStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                    >
                      <option value="vacant">Vacant</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notes</label>
                  <textarea
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Describe the unit layout, condition, or special rules..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  />
                </div>
              </section>

              <section className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <ApplianceInventoryForm inventory={inventory} setInventory={setInventory} />
              </section>
            </div>

            {/* Right Column: Pricing & Action */}
            <div className="space-y-6">
               <section className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-100">
                  <CreditCard className="h-5 w-5 text-zinc-400" />
                  <h2 className="text-lg font-semibold text-zinc-900">Pricing</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Security Deposit (₹)</label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    required
                  />
                </div>
              </section>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Units are visible to potential tenants only if they are marked as **Vacant**.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                  loading ? "bg-zinc-400 cursor-not-allowed" : "bg-zinc-900 hover:bg-zinc-800 text-white"
                }`}
              >
                {loading ? "Creating..." : (
                  <>
                    <Save className="h-5 w-5" />
                    Create Unit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
