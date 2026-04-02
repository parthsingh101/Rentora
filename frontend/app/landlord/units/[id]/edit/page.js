"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, Info, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ApplianceInventoryForm from "@/components/units/ApplianceInventoryForm";

export default function EditUnitPage() {
  const { id: unitId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (unitId) fetchUnit();
  }, [unitId]);

  const fetchUnit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({
          unitName: data.unitName,
          monthlyRent: data.monthlyRent,
          securityDeposit: data.securityDeposit,
          occupancyStatus: data.occupancyStatus,
          notes: data.notes || "",
        });
        setInventory(data.applianceInventory || []);
      } else {
        setError(data.message || "Failed to fetch unit details");
      }
    } catch (error) {
      console.error("Error fetching unit:", error);
      setError("An unexpected error occurred while loading");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify({
          ...formData,
          applianceInventory: inventory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Unit updated successfully!");
        setTimeout(() => {
          router.push(`/landlord/units/${unitId}`);
        }, 1500);
      } else {
        setError(data.message || "Failed to update unit");
      }
    } catch (err) {
      console.error("Error updating unit:", err);
      setError("An unexpected error occurred while saving");
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={`/landlord/units/${unitId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Unit Details
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Edit Unit</h1>
            <p className="text-zinc-500">Update the configuration for {formData.unitName}.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      <option value="occupied">Occupied</option>
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
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  />
                </div>
              </section>

              <section className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <ApplianceInventoryForm inventory={inventory} setInventory={setInventory} />
              </section>
            </div>

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
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                    required
                  />
                </div>
              </section>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
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
                disabled={saving}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                  saving ? "bg-zinc-400 cursor-not-allowed" : "bg-zinc-900 hover:bg-zinc-800 text-white"
                }`}
              >
                {saving ? "Saving Changes..." : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
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
