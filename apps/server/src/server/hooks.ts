import { DEFAULT_DEVICE_ID } from '../data/session/constants';
import { FastifyRequest } from 'fastify';

const deviceId = async (request: FastifyRequest) => {
  const deviceHeader = request.headers['x-device-id'];
  request.deviceId = Array.isArray(deviceHeader) ? deviceHeader[0] : (deviceHeader ?? DEFAULT_DEVICE_ID);
};

export const hooks = [deviceId];
