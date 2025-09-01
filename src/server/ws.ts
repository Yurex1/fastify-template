import { WebSocketServer } from 'ws';
import { config } from '../config';
import { ApiError, exception } from '../utils/exception/util';
import { Repos } from '../data/types';
import { WsServer } from './types';

export const init = (_repos: Repos) => {
  let wsServer: WsServer;

  if (config.node_env === 'test') {
    
    wsServer = {
      server: null as any,
      connections: new Map(),

      _listen() {
        
      },

      hasConnection(id) {
        return false;
      },

      send(id: number, message) {
        throw exception.notFound('Socket not found.');
      },
    };
  } else {
    
    wsServer = {
      server: new WebSocketServer(config.server.ws),
      connections: new Map(),

      _listen() {
        this.server.on('connection', async (ws, request) => {
          try {
            const token = request.url?.split('/')[2];
            
            const uid = 10; 

            this.connections.set(+uid, ws);
            ws.on('close', () => this.connections.delete(+uid));
          } catch (e) {
            console.log(e);
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

      send(id: number, message) {
        const socket = this.connections.get(id);
        if (!socket) throw exception.notFound('Socket not found.');
        return socket.send(JSON.stringify(message));
      },
    };

    wsServer._listen();
    console.log('WS server listening on 9090...');
  }

  return wsServer;
};
