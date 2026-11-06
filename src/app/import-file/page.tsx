import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import ImportRoster from "@/components/import-roster";

export default async function ImportFilePage() {
  if (!(await hasAdminSession())) redirect("/vote");
  return <ImportRoster/>;
}
