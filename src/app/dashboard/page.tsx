import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import Dashboard from "@/components/dashboard";
import { getResults } from "@/app/actions";

export default async function DashboardPage() {
  if (!(await hasAdminSession())) redirect("/vote");
  const initial = await getResults();
  return <Dashboard initial={initial}/>;
}
