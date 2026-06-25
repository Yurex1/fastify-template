import type { WsAdapter } from './types';

export const createWsHolder = (): { proxy: WsAdapter; set: (adapter: WsAdapter) => void } => {
  let ws: WsAdapter | null = null;

  const proxy: WsAdapter = {
    hasConnection: (id) => ws?.hasConnection(id) ?? false,
    hasConnectionForDevice: (userId, deviceId) => ws?.hasConnectionForDevice(userId, deviceId) ?? false,
    send: (id, message) => {
      if (!ws) {
        console.warn('ws.send called before ws was connected', { id, message });
        return;
      }
      ws.send(id, message);
    },
  };

  return {
    proxy,
    set: (adapter: WsAdapter) => {
      ws = adapter;
    },
  };
};
