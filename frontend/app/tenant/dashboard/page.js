import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TenantAssignment from "@/models/TenantAssignment";
import MonthlyBill from "@/models/MonthlyBill";
import MaintenanceIssue from "@/models/MaintenanceIssue";
import Notice from "@/models/Notice";
import Document from "@/models/Document";
import Property from "@/models/Property"; // Needed for refs
import Unit from "@/models/Unit"; // Needed for refs
import User from "@/models/User"; // Needed for refs
import StatCard from "@/components/dashboard/StatCard";
import DashboardSection from "@/components/dashboard/DashboardSection";
import { 
  Building2, 
  Home, 
  CreditCard, 
  Zap, 
  AlertCircle, 
  FileCheck,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default async function TenantDashboard() {
  const session = await auth();
  const tenantId = session.user.id;

  await dbConnect();

  // 1. Get the current active assignment
  const assignment = await TenantAssignment.findOne({ tenantId, status: "active" })
    .populate("propertyId")
    .populate("unitId")
    .populate("landlordId", "name email phone")
    .lean();

  if (!assignment) {
    return <NoAssignmentState />;
  }

  // Get current month info
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  // 2. Fetch specific data for this tenant
  const [
    currentBill,
    openIssuesCount,
    totalDocsCount,
    recentBills,
    recentNotices,
    recentIssues,
    agreementDoc
  ] = await Promise.all([
    MonthlyBill.findOne({ tenantId, billingMonth: currentMonth, billingYear: currentYear }).lean(),
    MaintenanceIssue.countDocuments({ tenantId, status: { $ne: "resolved" } }),
    Document.countDocuments({ tenantId }),
    MonthlyBill.find({ tenantId }).sort({ createdAt: -1 }).limit(5).lean(),
    Notice.find({ 
      $or: [
        { tenantId }, 
        { propertyId: assignment.propertyId?._id },
        { tenantId: null, propertyId: null } // System-wide
      ] 
    }).sort({ createdAt: -1 }).limit(5).lean(),
    MaintenanceIssue.find({ tenantId }).sort({ createdAt: -1 }).limit(5).lean(),
    Document.findOne({ tenantId, documentType: "agreement" }).sort({ createdAt: -1 }).lean()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Lease Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white shadow-xl dark:bg-zinc-900 border border-zinc-800">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight italic">Welcome Home, {session.user.name.split(' ')[0]}!</h1>
          <p className="mt-2 text-zinc-400">
            You are currently residing at <span className="font-semibold text-white">{assignment.propertyId?.propertyName}</span>, 
            Unit <span className="font-semibold text-white">{assignment.unitId?.unitName}</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <Clock size={16} className="text-blue-400" />
              <span>Lease ends: {new Date(assignment.leaseEndDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <Building2 size={16} className="text-purple-400" />
              <span>{assignment.propertyId?.address}</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Property"
          value={assignment.propertyId?.propertyName || "N/A"}
          icon={Building2}
          color="blue"
          description="Your current home"
        />
        <StatCard
          title="My Unit"
          value={assignment.unitId?.unitName || "N/A"}
          icon={Home}
          color="purple"
          description="Assigned unit"
        />
        <StatCard
          title="Total Due"
          value={currentBill ? `₹${currentBill.totalAmount}` : "₹0"}
          icon={CreditCard}
          color={currentBill?.paymentStatus === 'overdue' ? 'red' : 'orange'}
          description={currentBill ? `${currentMonth} ${currentYear}` : "No bill yet"}
        />
        <StatCard
          title="Status"
          value={currentBill?.paymentStatus?.toUpperCase() || "N/A"}
          icon={FileCheck}
          color={currentBill?.paymentStatus === 'paid' ? 'green' : 'zinc'}
          description="Current payment status"
        />
        <StatCard
          title="Rent Amount"
          value={`₹${assignment.agreedMonthlyRent}`}
          icon={CreditCard}
          color="zinc"
          description="Base monthly rent"
        />
        <StatCard
          title="Electricity"
          value={currentBill ? `₹${currentBill.electricityBill}` : "₹0"}
          icon={Zap}
          color="blue"
          description="Current period"
        />
        <StatCard
          title="Open Issues"
          value={openIssuesCount}
          icon={AlertCircle}
          color="red"
          description="Pending repairs"
        />
        <StatCard
          title="Documents"
          value={totalDocsCount}
          icon={FileText}
          color="zinc"
          description="Agreements & ID proofs"
        />
      </div>

      {/* Activity Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Bills */}
        <DashboardSection title="My Recent Bills" href="/tenant/bills">
          {recentBills.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentBills.map((bill) => (
                <div key={bill._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{bill.billingMonth} {bill.billingYear}</p>
                    <p className="text-xs text-zinc-500">Rent + Utils</p>
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
            <EmptyState message="No previous bills found." />
          )}
        </DashboardSection>

        {/* Notices */}
        <DashboardSection title="Notices for You" href="/tenant/notices">
          {recentNotices.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentNotices.map((notice) => (
                <div key={notice._id.toString()} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{notice.title}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{notice.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">{notice.noticeType}</span>
                    <span className="text-[10px] text-zinc-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No notices at this time." />
          )}
        </DashboardSection>

        {/* Maintenance Issues */}
        <DashboardSection title="Recent Repair Requests" href="/tenant/issues">
          {recentIssues.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentIssues.map((issue) => (
                <div key={issue._id.toString()} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.title}</p>
                    <p className="text-xs text-zinc-500 capitalize">{issue.status.replace('_', ' ')} • {issue.priority} Priority</p>
                  </div>
                  <span className="text-xs text-zinc-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't raised any issues yet." />
          )}
        </DashboardSection>

        {/* Agreement Quick Access */}
        <DashboardSection title="Quick Access">
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <FileCheck className="text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Rent Agreement</h3>
                  <p className="text-xs text-zinc-500">Official lease documentation</p>
                </div>
              </div>
              {agreementDoc ? (
                <a 
                  href={agreementDoc.fileUrl} 
                  target="_blank"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                >
                  Download Agreement
                </a>
              ) : (
                <div className="mt-4 text-xs italic text-zinc-400">No agreement uploaded yet.</div>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-zinc-200 p-4 dark:border-zinc-800 text-center">
              <p className="text-xs text-zinc-500">Contact Landlord</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{assignment.landlordId?.name}</p>
              <p className="text-xs text-zinc-400">{assignment.landlordId?.email}</p>
              <p className="text-xs text-zinc-400">{assignment.landlordId?.phone || "No phone provided"}</p>
            </div>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function NoAssignmentState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800 mb-6">
        <Building2 className="h-10 w-10 text-zinc-400" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Welcome to Rentora!</h2>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-md">
        Your account is registered as a tenant, but you are not yet assigned to a property or unit. 
        Please contact your landlord to get started.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="px-6 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-colors">
          Go Back Home
        </Link>
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
