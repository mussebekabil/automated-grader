import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; 
import { TABLE_NAME } from "./constants";


export const saveGradeItem = async (item: any) => {
  const client = new DynamoDBClient({}); 
  const input = { 
    TableName: TABLE_NAME, 
    Item: item
  };
  try {
    const command = new PutItemCommand(input);
    const response = await client.send(command);
    
    return response; 
  } catch (error) {
    console.log(error);
  }
}
