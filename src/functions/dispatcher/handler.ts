import { v4 as uuid } from 'uuid';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { SQS } from '@libs/sqs'; 
import schema from '@schemas/submission.json';

const dispatcher: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { body } = event; 
  const sqs = new SQS();

  await sqs.publishSubmissionEvent({
    id: uuid(), 
    type: body.graderImage,
    source: '/grade',
    data: JSON.stringify(body)
  })

  return formatJSONResponse({ message: "Successfully published submission to grader service."});
};


export const main = middyfy(dispatcher);
