import { CloudEvent, CloudEventV1, Version } from 'cloudevents';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// import submissionSchema from '@schemas/submission.json';

type PayloadType = {
  id: string; 
  type: string;
  source: string;
  data: string;
} 

export class SNSPublisher {
  eventData : CloudEventV1<string>; 
  constructor() {
    this.eventData = null;
  }

  private createSubmissionEvent(payload : PayloadType) {
    this.eventData = new CloudEvent({
      specversion: Version.V1,
      //dataschema: submissionSchema, 
      ...payload
    })
  }

  private async publishSNSMessage() {
    const params = {
      Message: JSON.stringify(this.eventData),
      TopicArn: process.env.GRADER_SNS_TOPIC_ARN
    };
    const snsClient = new SNSClient({});
    try {
      const data = await snsClient.send(new PublishCommand(params));
      console.log(`Sent message to sns topic ${params.TopicArn}, message: ${params.Message}`);
      return data; 
    } catch (err) {
      console.log("SNS publish error", err.stack);
    }

  }

  async publishSubmissionEvent(payload : PayloadType) {
    this.createSubmissionEvent(payload); 
    await this.publishSNSMessage(); 
  }

  getEventData() { return this.eventData }
}
