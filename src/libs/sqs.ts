import { CloudEvent, CloudEventV1, Version } from 'cloudevents';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { GRADER_TYPES } from './constants';

type PayloadType = {
  id: string; 
  type: string;
  source: string;
  data: string;
} 

export class SQS {
  eventData : CloudEventV1<string>; 
  constructor() {
    this.eventData = null;
  }

  private createSubmissionEvent(payload : PayloadType) {
    this.eventData = new CloudEvent({
      specversion: Version.V1,
      ...payload
    })
  }

  private getQueueUrl() : string {
    switch (this.eventData.type) {
      case GRADER_TYPES.DART:
        return process.env.DART_QUEUE_URL;
      case GRADER_TYPES.DENO:
        return process.env.DENO_QUEUE_URL;
      case GRADER_TYPES.PYTHON:
        return process.env.PYTHON_QUEUE_URL;
      default:
        return '';
    }
  }
  private async publishSQSMessage() {
    const params = {
      MessageBody: JSON.stringify(this.eventData),
      QueueUrl: this.getQueueUrl()
    };
    const sqsClient = new SQSClient({});
    try {
      const data = await sqsClient.send(new SendMessageCommand(params));
      console.log(`Sent message to queue ${params.QueueUrl}`);
      return data; 
    } catch (err) {
      console.log("SQS publish error", err.stack);
    }

  }

  async publishSubmissionEvent(payload : PayloadType) {
    this.createSubmissionEvent(payload); 
    await this.publishSQSMessage(); 
  }

  getEventData() { return this.eventData }
}
