import type { SupabaseClient } from "@supabase/supabase-js";

export function subscribeToElectionChanges(client: SupabaseClient, refreshSnapshot: () => void) {
  const channel = client
    .channel("election-status")
    .on("postgres_changes", { event: "*", schema: "public", table: "elections" }, () => refreshSnapshot())
    .subscribe((status) => {
      // SUBSCRIBED fires on initial subscription and after automatic reconnects.
      if (status === "SUBSCRIBED") refreshSnapshot();
    });

  return () => {
    void client.removeChannel(channel);
  };
}
