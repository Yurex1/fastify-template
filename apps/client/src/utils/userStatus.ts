export function parseStatuses(raw: Array<{ userId: number; isOnline: boolean; lastseen?: string }>) {
  const onlineIds = new Set<number>();
  const lastSeenMap: Record<number, string> = {};

  for (const { userId, isOnline, lastseen } of raw) {
    if (isOnline) {
      onlineIds.add(userId);
    } else if (lastseen) {
      lastSeenMap[userId] = lastseen;
    }
  }

  return { onlineIds, lastSeenMap };
}
