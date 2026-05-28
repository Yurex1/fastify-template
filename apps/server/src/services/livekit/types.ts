export interface LiveKitService {
  token: (userId: number, roomName: string) => Promise<{ token: string }>;
  room: (roomName: string) => Promise<any>;
  delete: (roomName: string) => Promise<{ success: boolean }>;
}
