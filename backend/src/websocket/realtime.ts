import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface JobStatusEvent {
  type: 'job-status';
  payload: {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    message?: string;
    data?: Record<string, unknown>;
    error?: string;
    updatedAt: string;
  };
}

let webSocketServer: WebSocketServer | null = null;

function safeSend(socket: WebSocket, body: unknown): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(body));
  }
}

export function initializeWebSocketServer(server: HttpServer): void {
  if (webSocketServer) {
    return;
  }

  webSocketServer = new WebSocketServer({
    server,
    path: '/ws',
  });

  webSocketServer.on('connection', (socket) => {
    safeSend(socket, {
      type: 'connected',
      message: 'WebSocket connected',
      timestamp: new Date().toISOString(),
    });
  });

  console.log('✅ WebSocket server ready at /ws');
}

export function broadcastJobStatus(event: JobStatusEvent): void {
  if (!webSocketServer) {
    return;
  }

  for (const socket of webSocketServer.clients) {
    safeSend(socket, event);
  }
}

export async function closeWebSocketServer(): Promise<void> {
  if (!webSocketServer) {
    return;
  }

  await new Promise<void>((resolve) => {
    webSocketServer?.close(() => resolve());
  });

  webSocketServer = null;
}
