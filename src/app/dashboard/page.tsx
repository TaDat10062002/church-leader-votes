import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import Dashboard from "@/components/dashboard";

export default async function DashboardPage() {
  if (!(await hasAdminSession())) redirect("/vote");
  return <Dashboard/>;
}
