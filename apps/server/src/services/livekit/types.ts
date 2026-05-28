export interface LiveKitService {
  token: (userName: string, roomName: string) => Promise<{ token: string }>;
  room: (roomName: string) => Promise<any>;
  delete: (roomName: string) => Promise<{ success: boolean }>;
}
