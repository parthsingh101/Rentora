import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function LandlordLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "landlord" && session.user.role !== "admin") {
    redirect("/");
  }

  return <DashboardLayout role="landlord">{children}</DashboardLayout>;
}
