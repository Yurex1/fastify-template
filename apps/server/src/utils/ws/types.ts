export interface WsAdapter {
  hasConnection: (id: number) => boolean;
  hasConnectionForDevice: (userId: number, deviceId: string) => boolean;
  send: (id: number, message: object) => void;
}
