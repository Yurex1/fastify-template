import { DEFAULT_DEVICE_ID } from '../data/session/constants';

import { FastifyRequest, FastifyReply } from 'fastify';

const deviceId = async (request: FastifyRequest, _reply: FastifyReply) => {
  const deviceHeader = request.headers['x-device-id'];
  const value = Array.isArray(deviceHeader) ? deviceHeader[0] : deviceHeader;
  request.deviceId = value?.trim() ? value : DEFAULT_DEVICE_ID;
};

const crossOriginOpenerPolicy = async (_request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
  reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  return payload;
};

export const onRequestHooks = [deviceId];
export const onSendHooks = [crossOriginOpenerPolicy];
