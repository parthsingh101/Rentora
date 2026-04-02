import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import TenantAssignment from "@/models/TenantAssignment";
import MonthlyBill from "@/models/MonthlyBill";
import MaintenanceIssue from "@/models/MaintenanceIssue";
import Document from "@/models/Document";
import Notice from "@/models/Notice";
import User from "@/models/User"; // Required for population/refs
import StatCard from "@/components/dashboard/StatCard";
import DashboardSection from "@/components/dashboard/DashboardSection";
import { 
  Building2, 
  Home, 
  UserCheck, 
  Users, 
  FileText, 
  AlertCircle, 
  Clock, 
  FileCheck 
} from "lucide-react";

export default async function LandlordDashboard() {
  const session = await auth();
  const landlordId = session.user.id;

  await dbConnect();

  // Get current month info for "Pending Bills This Month"
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  // Data Fetching - Run in parallel for performance
  const [
    totalProperties,
    totalUnits,
    occupiedUnits,
    activeTenants,
    pendingBillsMonth,
    overdueBills,
    openIssues,
    totalDocs,
    recentTenants,
    recentBills,
    recentIssues,
    recentNotices
  ] = await Promise.all([
    Property.countDocuments({ landlordId }),
    Unit.countDocuments({ landlordId }),
    Unit.countDocuments({ landlordId, occupancyStatus: "occupied" }),
    TenantAssignment.countDocuments({ landlordId, status: "active" }),
    MonthlyBill.countDocuments({ landlordId, billingMonth: currentMonth, billingYear: currentYear, paymentStatus: "pending" }),
    MonthlyBill.countDocuments({ landlordId, paymentStatus: "overdue" }),
    MaintenanceIssue.countDocuments({ landlordId, status: "open" }),
    Document.countDocuments({ landlordId }),
    
    // Recent Data
    TenantAssignment.find({ landlordId })
      .populate("tenantId", "name email")
      .populate("unitId", "unitName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    MonthlyBill.find({ landlordId })
      .populate("tenantId", "name")
      .populate("unitId", "unitName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    MaintenanceIssue.find({ landlordId, status: "open" })
      .populate("tenantId", "name")
      .populate("unitId", "unitName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    Notice.find({ landlordId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 italic">Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Welcome back! Here's what's happening with your properties.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          icon={Building2}
          color="blue"
          description="High-level buildings"
        />
        <StatCard
          title="Total Units"
          value={totalUnits}
          icon={Home}
          color="purple"
          description="Across all properties"
        />
        <StatCard
          title="Occupied Units"
          value={occupiedUnits}
          icon={UserCheck}
          color="green"
          description={`${totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}% occupancy rate`}
        />
        <StatCard
          title="Active Tenants"
          value={activeTenants}
          icon={Users}
          color="zinc"
          description="Verified residents"
        />
        <StatCard
          title="Pending Bills"
          value={pendingBillsMonth}
          icon={Clock}
          color="orange"
          description={`For ${currentMonth} ${currentYear}`}
        />
        <StatCard
          title="Overdue Bills"
          value={overdueBills}
          icon={FileText}
          color="red"
          description="Requires immediate action"
        />
        <StatCard
          title="Open Issues"
          value={openIssues}
          icon={AlertCircle}
          color="red"
          description="Maintenance requests"
        />
        <StatCard
          title="Documents"
          value={totalDocs}
          icon={FileCheck}
          color="blue"
          description="Agreements & receipts"
        />
      </div>

      {/* Recent Activity Sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Tenants */}
        <DashboardSection title="Recent Tenants" href="/landlord/tenants">
          {recentTenants.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentTenants.map((assign) => (
                <div key={assign._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{assign.tenantId?.name || "Unknown"}</p>
                    <p className="text-xs text-zinc-500">{assign.unitId?.unitName || "Unassigned"}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${assign.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {assign.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No recent tenant assignments found." />
          )}
        </DashboardSection>

        {/* Recent Bills */}
        <DashboardSection title="Recent Bills" href="/landlord/billing">
          {recentBills.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentBills.map((bill) => (
                <div key={bill._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{bill.tenantId?.name || "Unknown"}</p>
                    <p className="text-xs text-zinc-500">{bill.billingMonth} {bill.billingYear} - {bill.unitId?.unitName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">₹{bill.totalAmount}</p>
                    <p className={`text-[10px] uppercase font-bold ${bill.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {bill.paymentStatus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No recent bills generated." />
          )}
        </DashboardSection>

        {/* Maintenance Issues */}
        <DashboardSection title="Maintenance Issues" href="/landlord/issues">
          {recentIssues.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentIssues.map((issue) => (
                <div key={issue._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${issue.priority === 'high' ? 'bg-red-500' : issue.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.title}</p>
                      <p className="text-xs text-zinc-500">{issue.unitId?.unitName} • {issue.tenantId?.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No open maintenance issues." />
          )}
        </DashboardSection>

        {/* Recent Notices */}
        <DashboardSection title="Recent Notices" href="/landlord/notices">
          {recentNotices.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentNotices.map((notice) => (
                <div key={notice._id.toString()} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{notice.title}</p>
                  <p className="text-xs text-zinc-500 line-clamp-1">{notice.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">{notice.noticeType}</span>
                    <span className="text-[10px] text-zinc-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No notices sent recently." />
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
