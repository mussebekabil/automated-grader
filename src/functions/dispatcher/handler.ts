import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from '@schemas/submission';

const dispatcher: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  // TODO: Should support multiple courses and fan-out the submission to it's own topic 
  const { body } = event; 

  return formatJSONResponse(body);
};

export const main = middyfy(dispatcher);
