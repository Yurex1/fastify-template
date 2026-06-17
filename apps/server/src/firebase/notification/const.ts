export const PERMANENTLY_INVALID_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

export const TRANSIENT_CODES = new Set([
  'messaging/quota-exceeded',
  'messaging/message-rate-exceeded',
  'messaging/device-message-rate-exceeded',
  'messaging/internal-error',
  'messaging/server-unavailable',
]);
