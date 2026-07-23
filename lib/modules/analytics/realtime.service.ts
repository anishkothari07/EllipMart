export class RealtimeService {
  private static clients: Set<(data: string) => void> = new Set();

  static addClient(sendFn: (data: string) => void) {
    this.clients.add(sendFn);
  }

  static removeClient(sendFn: (data: string) => void) {
    this.clients.delete(sendFn);
  }

  static broadcast(event: string, payload: any) {
    const message = `event: message\ndata: ${JSON.stringify({ event, payload })}\n\n`;
    for (const sendFn of this.clients) {
      try {
        sendFn(message);
      } catch {}
    }
  }
}
