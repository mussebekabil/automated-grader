import schema from '@schemas/submission';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'grade',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};
