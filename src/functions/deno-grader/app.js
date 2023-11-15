"use strict";
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb'); 

const formatResponse = (message, statusCode = 200 ) => ({
    statusCode,
    body: JSON.stringify(message)
}); 

const copySubmission = (data) => {
    try {
        const [key, value] =  Object.entries(data)[0]; 
        fs.writeFileSync(`/tmp/${key}`, value); 
        console.log(`Successfully copied /tmp/${key}`);       
    } catch (error) {
        console.log(error)
    }
}

const gradeSubmission = async ({ code, testFiles }) => {
    try {
        [code, testFiles].map(data => copySubmission(data)); 
        
        await exec('./grade.sh');
    } catch (error) {
        console.error(error)
    }
}

const updateGradeItem = async (requestId) => {
    const client = new DynamoDBClient({}); 
    console.log(`Started updating table. requestId: `, requestId);
    const input = { 
        TableName: "grading-table", 
        Key: { requestId: { "S": requestId }},
        ExpressionAttributeNames: {
            "#ET": "endTime"
        },
        ExpressionAttributeValues: {
            ":t": {
                "S": new Date().toISOString()
            }
        },
        UpdateExpression: "set #ET = :t"
    };
    try {
        const command = new UpdateItemCommand(input);
        await client.send(command);
    } catch (error) {
        console.log(error);
    }
}

exports.handler = async (event, context) => {
    if (!event || !event.Records) {
        return formatResponse("Invalid request", 400);
    }
    try {
        const { Records } = event;
        const testResult = []; 
        await Promise.all(Records.map(async (record) => {
            const { id, data } = JSON.parse(record.body);
            const parsedData = typeof data === "object" ? data : JSON.parse(data);
            await gradeSubmission(parsedData);
            testResult.push(JSON.parse(fs.readFileSync('/tmp/results.json', 'utf8')));
            console.log("Test results: ", testResult);

            await updateGradeItem(id);
        }));
        
        // Clean up test results
        await exec('./cleanup.sh');

        return formatResponse(testResult);
    } catch (e) {
        console.error(e);
        return formatResponse({ error: e.stack }, 500);
    }
}
