import http from "k6/http";
import { check, sleep } from "k6";

const API_ENDPOINT = "https://ugetxyfmdl.execute-api.eu-west-1.amazonaws.com/dev/grade";

export const options = {
  duration: "1s",
  vus: 1,
  summaryTrendStats: ["avg", "med", "p(95)", "p(99)"],
}


/**
 * Grade request load test
 * Note: the API success response refers when code is enqueued not grading is completed
 */
export default function() {
  const headers = { "Content-Type": "application/json"};
 
  const payload = JSON.stringify(JSON.parse({
    "code": { 
      "app.js": "const fun = () => {\nreturn 1;\n}; export { fun };" 
    },
    "testFiles": {
      "app_test.js": "import { assertEquals } from 'https://deno.land/std@0.171.0/testing/asserts.ts'; \nimport { fun } from './app.js';\nDeno.test('Call fun.', async () => {\n  assertEquals(1, fun());\n});"
    },
    "responseUrl": "http://localhost:12345",
    "jobId": 1,
    "withDatabase": false,
    "graderImage": "deno-grader"
  }))

  const res = http.post(API_ENDPOINT, payload, headers );

  check(res, {
    'Post status is 200': (r) => res.status === 200,
    'Post Content-Type header': (r) => res.headers['Content-Type'] === 'application/json',
    'Post response message': (r) => res.status === 200 && res.json().message === 'Successfully published submission to grader service.',
  });
  
  sleep(0.3);
}

