import VotePageClient from "@/components/vote-page-client";
import { getActiveElection } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const initial = await getActiveElection();
  return <VotePageClient initial={initial} />;
}
