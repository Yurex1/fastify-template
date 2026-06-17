import { FastifyInstance } from 'fastify';
import { serializeError } from '../utils/exception/util';

export const createDispatch = (fastify: FastifyInstance) => {
  return async (uid: number, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      fastify.ws.send(uid, {
        type: 'ERROR',
        payload: { success: false, data: null, error: serializeError(err) },
      });
    }
  };
};
