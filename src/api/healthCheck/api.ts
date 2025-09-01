import * as schemas from './schemas';
import { Api, Deps } from './types';

export const init = ({ service, notification }: Deps): Api => ({
  'health-check': {
    method: 'get',
    access: 'none',
    schema: schemas.healthCheck,
    handler: async (_user, _request) => {
      const message = service.check();

      try {
        await notification.sendNotification('Set token here', 'App Status', 'APP is running');
      } catch (error) {
        console.error('Failed to send health check notification:', error);
      }

      return { message };
    },
  },
});
