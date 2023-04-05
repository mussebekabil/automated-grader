// Tested for Deno 1.22.0
const resultsText = await Deno.readTextFileSync('/tmp/results.out');
const errorsText = await Deno.readTextFileSync('/tmp/results.err');

const filthyCharRegex = /(\x1b|\\x1b)\[[0-9]*m?/g;
const cleanedOutputText = resultsText.replaceAll(filthyCharRegex, '').replaceAll('\\n', '\n')
const cleanedErrorsText = errorsText.replaceAll(filthyCharRegex, '');

let inTests = false;
let inFailures = false;
let inOutput = false;

const parseTests = () => {
    const tests = [];
    for (const line of cleanedOutputText.split('\n')) {
        if (/------- output -------/.test(line)) {
            inOutput = true;
            continue;
        }

        if (/----- output end -----/.test(line)) {
            inOutput = false;
            continue;
        }

        if (inOutput) {
            continue;
        }

        if (/running [0-9]+ test/.test(line)) {
            inTests = true;
        }

        if (/ERRORS/.test(line) || /FAILURES/.test(line)) {
            inTests = false;
            inFailures = !inFailures;
            continue;
        }

        if (inTests) {
            const lineParts = line.split(' ...');
            if (lineParts.length != 2 || lineParts[1].trim().length == 0) continue;
            tests.push({
                testName: lineParts[0],
                passed: /ok/.test(lineParts[1]),
                'test output': ''
            });
        }

        if (inFailures) {
            // --fail-fast is used to stop tests on first failure, so failing test is always the last one
            if (!line.trim().startsWith('at ') && !line.trim().includes("=>")) {
                if (tests.length > 0) {
                    const failingTest = tests[tests.length - 1];
                    failingTest['test output'] += line + '\n';
                    failingTest.passed = false;
                }
            }
        }
    }

    // trim unnecessary linebreaks from the test output of the last test
    if (tests.length > 0) {
        const lastTest = tests[tests.length - 1];
        lastTest['test output'] =
            lastTest['test output'].replace(/\n{3,}\s*/g, '\n\n').trim();
    }

    return tests;
};

const testResultSummaryMatch =
    /(\w+) | ([0-9]+) passed | ([0-9]+) failed/.test(cleanedOutputText);
// 1.22.0:    /test result: (\w+). ([0-9]+) passed; ([0-9]+) failed;/.test(cleanedOutputText);

const resultJson = {
    testOutput: cleanedOutputText,
    testErrors: cleanedErrorsText,
    tests: testResultSummaryMatch ? parseTests() : [], // If there is no final test result line, we can assume the tests have crashed
    // TODO: specify more better way to indicate inability to parse results. (now: empty tests results)
};

console.log(JSON.stringify(resultJson));
