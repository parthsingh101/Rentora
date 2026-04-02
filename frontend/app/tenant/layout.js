import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function TenantLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "tenant" && session.user.role !== "admin") {
    redirect("/");
  }

  return <DashboardLayout role="tenant">{children}</DashboardLayout>;
}
