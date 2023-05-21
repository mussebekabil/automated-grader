import { v4 as uuid } from 'uuid';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { SQS } from '@libs/sqs'; 
import { saveGradeItem } from '@libs/db';
import schema from '@schemas/submission.json';

const dispatcher: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { body } = event; 
  const submittedCode = typeof body === "object" ? body : JSON.parse(body)
  const sqs = new SQS();
  const requestId = uuid();
  const type = submittedCode["graderImage"]; 

  await saveGradeItem({
    requestId: { "S": requestId }, 
    type: { "S": type },
    startTime: { "S": new Date().toISOString() },
  });

  await sqs.publishSubmissionEvent({
    id: requestId, 
    type,
    source: '/grade',
    data: JSON.stringify(body)
  })

  return formatJSONResponse({ message: "Successfully published submission to grader service."});
};


export const main = middyfy(dispatcher);
