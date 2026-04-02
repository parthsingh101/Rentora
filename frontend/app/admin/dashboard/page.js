import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import TenantAssignment from "@/models/TenantAssignment";
import MonthlyBill from "@/models/MonthlyBill";
import MaintenanceIssue from "@/models/MaintenanceIssue";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSection from "@/components/dashboard/DashboardSection";
import { 
  Users, 
  UserPlus, 
  Building2, 
  Home, 
  UserCheck, 
  CreditCard, 
  AlertTriangle, 
  Wrench,
  Clock
} from "lucide-react";

export default async function AdminDashboard() {
  await dbConnect();

  // Platform-wide Data Fetching
  const [
    totalLandlords,
    totalTenants,
    totalProperties,
    totalUnits,
    activeAssignments,
    pendingBills,
    overdueBills,
    openIssues,
    recentLandlords,
    recentTenants,
    recentProperties,
    recentIssues,
    recentBills
  ] = await Promise.all([
    User.countDocuments({ role: "landlord" }),
    User.countDocuments({ role: "tenant" }),
    Property.countDocuments({}),
    Unit.countDocuments({}),
    TenantAssignment.countDocuments({ status: "active" }),
    MonthlyBill.countDocuments({ paymentStatus: "pending" }),
    MonthlyBill.countDocuments({ paymentStatus: "overdue" }),
    MaintenanceIssue.countDocuments({ status: "open" }),
    
    // Recent Data
    User.find({ role: "landlord" }).sort({ createdAt: -1 }).limit(5).lean(),
    User.find({ role: "tenant" }).sort({ createdAt: -1 }).limit(5).lean(),
    Property.find({}).populate("landlordId", "name").sort({ createdAt: -1 }).limit(5).lean(),
    MaintenanceIssue.find({ status: "open" })
      .populate("tenantId", "name")
      .populate("unitId", "unitName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    MonthlyBill.find({})
      .populate("tenantId", "name")
      .populate("landlordId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 italic">Platform Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Managing the entire Rentora ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Landlords"
          value={totalLandlords}
          icon={Users}
          color="blue"
          description="Registered owners"
        />
        <StatCard
          title="Total Tenants"
          value={totalTenants}
          icon={UserPlus}
          color="purple"
          description="Registered residents"
        />
        <StatCard
          title="Total Properties"
          value={totalProperties}
          icon={Building2}
          color="zinc"
          description="Buildings on platform"
        />
        <StatCard
          title="Total Units"
          value={totalUnits}
          icon={Home}
          color="zinc"
          description="Available inventory"
        />
        <StatCard
          title="Active Leases"
          value={activeAssignments}
          icon={UserCheck}
          color="green"
          description="Current assignments"
        />
        <StatCard
          title="Pending Bills"
          value={pendingBills}
          icon={CreditCard}
          color="orange"
          description="Awaiting payment"
        />
        <StatCard
          title="Overdue Bills"
          value={overdueBills}
          icon={AlertTriangle}
          color="red"
          description="Payment required"
        />
        <StatCard
          title="Open Issues"
          value={openIssues}
          icon={Wrench}
          color="red"
          description="Requires attention"
        />
      </div>

      {/* Recent Activity Sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Landlords */}
        <DashboardSection title="Recent Landlords">
          {recentLandlords.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentLandlords.map((user) => (
                <div key={user._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No landlords registered yet." />
          )}
        </DashboardSection>

        {/* Recent Tenants */}
        <DashboardSection title="Recent Tenants">
          {recentTenants.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentTenants.map((user) => (
                <div key={user._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No tenants registered yet." />
          )}
        </DashboardSection>

        {/* Recent Properties */}
        <DashboardSection title="Recent Properties">
          {recentProperties.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentProperties.map((prop) => (
                <div key={prop._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{prop.propertyName}</p>
                    <p className="text-xs text-zinc-500">Owner: {prop.landlordId?.name || "Deleted User"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">{prop.city}, {prop.state}</p>
                    <p className="text-[10px] uppercase font-bold text-blue-500">{prop.propertyType}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No properties added yet." />
          )}
        </DashboardSection>

        {/* Open Issues */}
        <DashboardSection title="Recent Open Issues">
          {recentIssues.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentIssues.map((issue) => (
                <div key={issue._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.title}</p>
                    <p className="text-xs text-zinc-500">{issue.unitId?.unitName} by {issue.tenantId?.name}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${issue.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-blue-100 text-blue-700'}`}>
                    {issue.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No open issues." />
          )}
        </DashboardSection>

        {/* Global Recent Bills */}
        <DashboardSection title="Recent Global Bills">
          {recentBills.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentBills.map((bill) => (
                <div key={bill._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">₹{bill.totalAmount}</p>
                    <p className="text-xs text-zinc-500">{bill.tenantId?.name} (Owner: {bill.landlordId?.name})</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {bill.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No bills generated." />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-zinc-50 p-3 dark:bg-zinc-900">
        <Clock className="h-6 w-6 text-zinc-400" />
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
