"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, UserPlus, Info, Mail, Phone, 
  Lock, Save, AlertCircle, ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CreateTenantPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token || ""}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Tenant account created successfully!");
        setTimeout(() => {
          router.push("/landlord/tenants");
        }, 1500);
      } else {
        setError(data.message || "Failed to create account");
      }
    } catch (err) {
      console.error("Error creating tenant:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/landlord/tenants"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Tenants
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-display">Create Tenant Account</h1>
            <p className="text-zinc-500">Register a new tenant user so you can assign them to a property.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4 hover:border-zinc-300 transition-all group">
                <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Info className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="font-bold text-zinc-900">Why create an account?</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Creating a tenant account allows the user to log in and see their bills, notices, and payment history.
                </p>
                <div className="pt-4 flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Secure Access</span>
                </div>
              </div>
              
              <div className="p-5 bg-zinc-900 text-white rounded-3xl shadow-xl space-y-4 select-none">
                 <h3 className="font-bold text-sm">Pro Tip</h3>
                 <p className="text-xs text-white/70 leading-relaxed font-medium">
                   If the tenant already has an account, skip this and use the **"Assign Unit"** workflow instead.
                 </p>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="md:col-span-2 space-y-6">
               <div className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm space-y-8">
                  <div className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] ml-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="space-y-2">
                         <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                           <Mail className="h-3 w-3" />
                           Email Address
                         </label>
                         <input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           placeholder="john@example.com"
                           className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                           required
                         />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                         <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                           <Phone className="h-3 w-3" />
                           Phone Number
                         </label>
                         <input
                           type="text"
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           placeholder="+91 XXXXX XXXXX"
                           className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                         />
                      </div>
                    </div>

                    {/* Temporary Password */}
                    <div className="space-y-2 pt-4 border-t border-zinc-100">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Temporary Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Default: Welcome@Rentora123"
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-950/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                      />
                      <p className="text-[10px] text-zinc-400 font-medium ml-1">
                        Leave blank to use the default temporary password.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-bold flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-5 rounded-2xl font-black text-white text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(24,24,27,0.3)] transition-all active:scale-95 ${
                      loading ? "bg-zinc-400 cursor-not-allowed" : "bg-black hover:bg-zinc-800"
                    }`}
                  >
                    {loading ? "Creating..." : (
                      <>
                        <Save className="h-6 w-6" />
                        Complete Registration
                      </>
                    )}
                  </button>
               </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
