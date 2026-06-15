import { DEFAULT_DEVICE_ID } from '../data/session/constants';

import { FastifyRequest, FastifyReply } from 'fastify';

const deviceId = async (request: FastifyRequest, _reply: FastifyReply) => {
  const deviceHeader = request.headers['x-device-id'];
  const value = Array.isArray(deviceHeader) ? deviceHeader[0] : deviceHeader;
  request.deviceId = value?.trim() ? value : DEFAULT_DEVICE_ID;
};

export const hooks = [deviceId];
