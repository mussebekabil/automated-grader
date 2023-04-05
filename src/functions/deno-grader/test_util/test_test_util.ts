// lol, sorry about the name of the file

interface TestOutput {
  coverage?: CoverageOutput[];
  tests: TestStatus;
}

interface TestStatus {
  error?: string;
  errors?: string[];
  passedTests?: number;
  failedTests?: number;
}

interface CoverageOutput {
  error?: string;
  file: string;
  percentage: number;
  linesCovered: number;
  linesTotal: number;
}

const clean = (s: string): string => {
  return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

const extractErrors = (errorOutput: string) : object => {
  const res: TestStatus = {
    error: "Errors when running tests.",
    errors: [],
  };

  const errorParts: string[] = errorOutput.split("\n").filter((l) => l.includes("error"));

  if (errorParts.length > 0) {

    res.errors = errorParts.map(
      (l: string) => {
        if (l.includes("at file")) {
          return l.substring(l.indexOf(":") + 1, l.indexOf("at file")).trim()
        } else {
          return l.trim();
        }
      }
    );
  }

  return res;
};

const arrayToCoverageOutput = (a: RegExpMatchArray | null): CoverageOutput => {
  if (a == null) {
    return {
      error: "RegExpMatchArray was null"
    } as CoverageOutput;
  }

  return {
    file: String(a[1]),
    percentage: Number(a[2]),
    linesCovered: Number(a[3]),
    linesTotal: Number(a[4]),
  } as CoverageOutput;
}

const extractCoverage = (coverageOutput: string, path: string): CoverageOutput[] => {
  return coverageOutput
    .split("\n")
    .filter(l => l.includes("cover"))
    .map(l => l.match(`.*${path}(.*) \.\.\. (.*)% \\((.*)/(.*)\\)`))
    .map(a => arrayToCoverageOutput(a));
}

const extractOutput = (output: string) : TestStatus => {
  const result = output.match(
    /.*(\d+)\s+passed.*(\d+)\s+failed/,
  );

  if (!result || !result.length || result.length < 2) {
    return {
      error: "Unable to extract test output from tests",
    } as TestStatus;
  } else {
    return {
      passed: Number(result[1]),
      failed: Number(result[2]),
    } as TestStatus;
  }
};

const runTestTests = async (projectPath: string) : Promise<TestOutput> => {
  const testRunner = Deno.run({
    cmd: [
      Deno.execPath(),
      "test",
      "--quiet",
      "--allow-net",
      "--allow-read",
      "--allow-run",
      "--unstable",
      "--no-check",
      "--cached-only",
      `--coverage=${projectPath}/test-coverage`,
      projectPath,
    ],
    cwd: projectPath,
    stdout: "piped",
    stderr: "piped",
  });

  const status = await testRunner.status();
  const programOutput = await testRunner.output();
  const errorOutput = await testRunner.stderrOutput();

  const output = clean(new TextDecoder().decode(programOutput));
  const errors = clean(new TextDecoder().decode(errorOutput));

  if (errors && errors.trim().length > 0 && errors.includes("error") && !errors.includes("Test failed")) {
    return {
      tests: extractErrors(errors)
    };
  } else {
    const coverageExtractor = Deno.run({
      cmd: [
        Deno.execPath(),
        "coverage",
        "--quiet",
        `${projectPath}/test-coverage`,
        projectPath,
      ],
      cwd: projectPath,
      stdout: "piped",
      stderr: "piped",
    });

    const coverageStatus = await coverageExtractor.status();
    const coverageOutput = await coverageExtractor.output();

    return {
      tests: extractOutput(output),
      coverage: extractCoverage(clean(new TextDecoder().decode(coverageOutput)), projectPath)
    } as TestOutput;
  }
};

export { runTestTests };