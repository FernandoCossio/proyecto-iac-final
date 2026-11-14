type SSEListener = (event: { type: string; payload: unknown }) => void;

class SSEBroadcaster {
  private channels = new Map<string, Set<SSEListener>>();

  public subscribe(tenantId: string, listener: SSEListener): () => void {
    if (!this.channels.has(tenantId)) {
      this.channels.set(tenantId, new Set());
    }
    const set = this.channels.get(tenantId)!;
    set.add(listener);

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.channels.delete(tenantId);
      }
    };
  }

  public broadcast(tenantId: string, type: string, payload: unknown): void {
    const listeners = this.channels.get(tenantId);
    if (!listeners || listeners.size === 0) return;

    for (const listener of listeners) {
      try {
        listener({ type, payload });
      } catch (err) {
        console.error(`Error sending SSE to listener on tenant ${tenantId}:`, err);
      }
    }
  }
}

const globalForBroadcaster = globalThis as unknown as {
  sseBroadcaster: SSEBroadcaster | undefined;
};

export const sseBroadcaster =
  globalForBroadcaster.sseBroadcaster ?? new SSEBroadcaster();

if (process.env.NODE_ENV !== "production") {
  globalForBroadcaster.sseBroadcaster = sseBroadcaster;
}
