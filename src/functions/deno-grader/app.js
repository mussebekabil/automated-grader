"use strict";
const util = require('util');
const fs = require('fs');

const formatResponse = (message, statusCode = 200 ) => ({
    statusCode,
    body: JSON.stringify(message)
}); 

const copySubmission = (data) => {
    try {
        const [key, value] =  Object.entries(data)[0]; 
        fs.writeFileSync(`/tmp/${key}`, value);        
    } catch (error) {
        console.log(error)
    }
}

const cleanUp = (data) => {
    try {
        if(typeof data === "string") {
            fs.unlinkSync(`/tmp/${data}`);    
            console.log(`Successfully removed /tmp/${data}`);
            return;  
        }
        const [key] =  Object.keys(data); 
        fs.unlinkSync(`/tmp/${key}`);    
        console.log(`Successfully removed /tmp/${key}`);    
    } catch (error) {
        console.log(error)
    }
}


const gradeSubmission = async ({ code, testFiles }) => {
    try {
        const exec = util.promisify(require('child_process').exec);
        [code, testFiles].map(data => copySubmission(data)); 
        
        await exec('sh grade.sh');

        // Clean up code and test submission
        [code, testFiles].map(file => cleanUp(file)); 
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
        
        const testResult = require('/tmp/results.json');
        console.log(testResult);
        
        // Clean up test results
        ["results.err", "results.out", "results.json"].map(file => cleanUp(file)); 

        return formatResponse(testResult);
    } catch (e) {
        console.error(e);
        return formatResponse({ error: e.stack }, 500);
    }
}
