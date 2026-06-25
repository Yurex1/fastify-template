import { ChatNotificationService, Deps } from './types';

export const init = ({ deviceTokenRepo, notificationService, ws }: Deps): ChatNotificationService => ({
  notifyMessageCreated: async ({ senderId, senderName, chatId, messageId, text, members }) => {
    await Promise.allSettled(
      members
        .filter((m) => m.userId !== senderId)
        .map(async (member) => {
          const devices = await deviceTokenRepo.findAllByUserId(member.userId);

          const offlineTokens = devices
            .filter((d) => !ws.hasConnectionForDevice(member.userId, d.deviceId))
            .map((d) => d.token);

          if (!offlineTokens.length) return;

          const { invalidTokens } = await notificationService.sendToUser(offlineTokens, senderName, text, {
            chatId: String(chatId),
            messageId: String(messageId),
          });

          await Promise.allSettled(invalidTokens.map((t) => deviceTokenRepo.removeByToken(t)));
        }),
    );
  },
});
