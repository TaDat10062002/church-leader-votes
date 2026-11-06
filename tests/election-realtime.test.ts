import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subscribeToElectionChanges } from "@/lib/election-realtime";

describe("election realtime subscription", () => {
  it("refreshes the server snapshot after changes and each successful reconnect", () => {
    const refresh = vi.fn();
    let onChange: ((payload?: unknown) => void) | undefined;
    let onStatus: ((status: string) => void) | undefined;
    const channel = {
      on: vi.fn((_event: string, _filter: unknown, callback: () => void) => { onChange = callback; return channel; }),
      subscribe: vi.fn((callback: (status: string) => void) => { onStatus = callback; return channel; }),
    };
    const client = {
      channel: vi.fn(() => channel),
      removeChannel: vi.fn(async () => "ok"),
    } as unknown as SupabaseClient;

    const unsubscribe = subscribeToElectionChanges(client, refresh);
    expect(channel.on).toHaveBeenCalledWith("postgres_changes", { event: "*", schema: "public", table: "elections" }, expect.any(Function));

    onChange?.({ new: { id: "election-1", status: "closed" } });
    onStatus?.("SUBSCRIBED");
    onStatus?.("CHANNEL_ERROR");
    onStatus?.("SUBSCRIBED");

    expect(refresh).toHaveBeenCalledTimes(3);
    expect(refresh).toHaveBeenNthCalledWith(1);
    unsubscribe();
    expect(client.removeChannel).toHaveBeenCalledWith(channel);
  });
});
