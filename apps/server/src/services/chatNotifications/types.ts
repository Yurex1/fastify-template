import type { DeviceTokenRepo } from '../../data/deviceToken/types';
import type { NotificationService } from '../../firebase/notification/service';

export interface ChatNotificationService {
  notifyMessageCreated(params: {
    senderId: number;
    senderName: string;
    chatId: number;
    messageId: number;
    text: string;
    members: { userId: number }[];
  }): Promise<void>;
}

export interface Deps {
  deviceTokenRepo: DeviceTokenRepo;
  notificationService: NotificationService;
}
