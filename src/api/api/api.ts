import * as schemas from './schemas';
import { Api, Deps } from './types';

export const init = ({ service }: Deps): Api => ({
  'health-check': {
    method: 'get',
    access: 'none',
    schema: schemas.healthCheck,
    handler: (_user, _request) => {
      const message = service.check();

      return { message };
    },
  },
});
