export class SSEManager {
  private clients: Map<string, Set<(data: string) => void>> = new Map();

  addClient(userId: string, sendFn: (data: string) => void) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(sendFn);
  }

  removeClient(userId: string, sendFn: (data: string) => void) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(sendFn);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  broadcastToUser(userId: string, eventName: string, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients && userClients.size > 0) {
      const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
      userClients.forEach((send) => {
        try {
          send(payload);
        } catch {}
      });
    }
  }
}

export const sseManager = new SSEManager();
