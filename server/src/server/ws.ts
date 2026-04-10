import { WebSocketServer } from 'ws';
import { config } from '../config';
import { ApiError, exception } from '../utils/exception/util';
import { Repos } from '../data/types';
import { WsServer } from './types';
import { init as authServiceInit } from '../services/auth/service';

function buildWsServer(repos: Repos): WsServer {
  const authService = authServiceInit({
    userRepo: repos.user,
  });

  return {
    server: new WebSocketServer(config.server.ws),
    connections: new Map(),

    _listen() {
      this.server.on('connection', async (ws, request) => {
        try {
          const token = request.url?.split('/')[2];
          const user = await authService.verify('common', `Bearer ${token}`);
          const uid = Number(user.id);
          this.connections.set(uid, ws);
          ws.on('close', () => this.connections.delete(uid));
        } catch (e) {
          const { message, statusCode } = exception.isCustomException(e)
            ? (e as ApiError)
            : exception.serverError('Web Socket Server Error.');
          ws.send(JSON.stringify({ message, statusCode }));
          ws.close();
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
      if (!socket) throw exception.notFound('SOCKET_NOT_FOUND');
      return socket.send(JSON.stringify(message));
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
