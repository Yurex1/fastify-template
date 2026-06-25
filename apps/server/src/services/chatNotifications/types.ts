import type { DeviceTokenRepo } from '../../data/deviceToken/types';
import type { NotificationService } from '../../firebase/notification/service';
import type { WsAdapter } from '../../utils/ws/types';

interface NotifyMessageCreatedProps {
  senderId: number;
  senderName: string;
  chatId: number;
  messageId: number;
  text: string;
  members: { userId: number }[];
}
export interface ChatNotificationService {
  notifyMessageCreated(params: NotifyMessageCreatedProps): Promise<void>;
}

export interface Deps {
  deviceTokenRepo: DeviceTokenRepo;
  notificationService: NotificationService;
  ws: WsAdapter;
}
