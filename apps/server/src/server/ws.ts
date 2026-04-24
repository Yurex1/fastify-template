import { WebSocketServer } from 'ws';
import { config } from '../config';
import { exception } from '../utils/exception/util';
import { Repos } from '../data/types';
import { WsServer } from './types';
import { init as authServiceInit } from '../services/auth/service';

function buildWsServer(repos: Repos): WsServer {
  const eventHandlers: Array<(uid: number, data: any) => void> = [];
  const authService = authServiceInit({
    userRepo: repos.user,
    sessionRepo: repos.sessions,
  });

  return {
    server: new WebSocketServer(config.server.ws),
    connections: new Map(),

    onMessage(handler) {
      eventHandlers.push(handler);
    },

    _listen() {
      this.server.on('connection', async (ws, request) => {
        try {
          const url = request.url || '';
          const parts = url.split('/');
          const token = parts[parts.length - 1];

          if (!token) {
            throw exception.unauthorized('NO_TOKEN_PROVIDED');
          }

          const user = await authService.verify('access', token);
          repos.user.updateLastSeen(user.id);
          const uid = Number(user.id);

          this.connections.set(uid, ws);

          ws.on('message', (rawData) => {
            try {
              const data = JSON.parse(rawData.toString());

              eventHandlers.forEach((handler) => handler(uid, data));
            } catch (e) {
              console.error('WS Parse Error', e);
            }
          });

          ws.on('close', () => {
            this.connections.delete(uid);
            repos.user.updateLastSeen(user.id);
          });
        } catch (e: any) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: e.message || 'TOKEN_VALIDATION_FAILED',
              statusCode: 401,
            }),
          );
          ws.close(1008, 'Authentication failed');
        }
      });
    },

    hasConnection(id) {
      const socket = this.connections.get(id);
      if (!socket) return false;
      if (socket.readyState !== socket.OPEN) {
        this.connections.delete(id);
        return false;
      }

      return true;
    },

    send(id, message) {
      const socket = this.connections.get(id);

      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify(message));
      }
    },
  };
}

export const init = (repos: Repos) => {
  const wsServer = buildWsServer(repos);

  if (config.node_env !== 'test') {
    console.log('Starting WS server...');
    wsServer._listen();
    console.log('WS server listening on 9090...');
  }

  return wsServer;
};
