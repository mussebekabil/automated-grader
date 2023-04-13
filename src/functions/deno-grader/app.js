"use strict";
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

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
        
        await exec('sh grade.sh');
    } catch (error) {
        console.error(error)
    }
}


exports.handler = async (event, context) => {
    if (!event || !event.Records) {
        return formatResponse("Invalid request", 400);
    }
    try {
        const { Records } = event;
        await Promise.all(Records.map(async (record) => {
            const { data } = JSON.parse(record.body);
            await gradeSubmission(JSON.parse(data));
        }));
        
        var testResult = JSON.parse(fs.readFileSync('/tmp/results.json', 'utf8'));
        console.log("Test results: ", testResult);

        // Clean up test results
        await exec('sh cleanup.sh');

        return formatResponse(testResult);
    } catch (e) {
        console.error(e);
        return formatResponse({ error: e.stack }, 500);
    }
}
