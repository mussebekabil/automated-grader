import { listNonWhitelistedLibraries } from "./library_test_util.ts";
import asyncTestUtil from "./async_test_util.ts";
import { assert, existsSync } from "./deps/deno_test_deps.ts";
import fileTestUtil from "./file_test_util.ts";


const waitForServerStartUp = async (serverUrl: string, timeoutMillis = 10000) => {
  const start = new Date().getTime()
  var done = false
  console.log(
    `Waiting for the server to start up at time ${
      new Date().toLocaleString("fi-FI")
    }`,
  );

  while (!done) {
    var attempt = 0

    if (new Date().getTime() - start > 1000) {
      console.log(`...timeout after ${timeoutMillis / 1000} seconds waiting for response`,);
      return
    }

    await asyncTestUtil.sleep(100)

    await timeoutFetch(serverUrl, {timeoutMillis: 3000})
      .then(
        () => done = true,
        () => {
          if (attempt % 10 === 0) {
            console.log(
              `...(error) waiting for server at time ${
                new Date().toLocaleString("fi-FI")
              }`,
            );
          }
        })

    attempt += 1
  }
  console.log(
    `...done! - got response from server at time ${
      new Date().toLocaleString("fi-FI")
    }`,
  );
};

const startServer = async (
  mainAppPath: string,
  serverUrl: string,
  moduleDir: string,
) => {
  const server = Deno.run({
    cmd: [
      Deno.execPath(),
      "run",
      "--quiet",
      "-A",
      "--unstable",
      "--no-check",
      "--cached-only",
      mainAppPath,
    ],
    cwd: moduleDir,
    stdout: "piped",
    stderr: "piped"
  });

  await waitForServerStartUp(serverUrl, 10000);
  return server;
};

var serverStopped = false
const stopServer = async (server: any) => {
  if (serverStopped) return
  var error = null;
  try {
    console.error('  closing server')

    const {success, code} = await deadline(server.status, 2000)
      .catch((e) => {
        // console.error(e)
        return {success: false, code: -1}
      })
    if (code === -1) {
      // server unaccessible
      // return
    }
    console.error(`  server status: ${success}, ${code}`)

    await server.close()
    serverStopped = true
    const output = await server.output()
    serverStopped = true
    if (!success || code != 0) {
      const errorOutput = await server.stderrOutput();
      error = new TextDecoder().decode(errorOutput);
    }
  } catch (error) {
    // Server already closed
    console.error('  error closing server')
    console.error(error);
  }
  if (error) throw `Errors running application: ${error}`
};

const runTests = async (
  tests = [],
  serverUrl = "http://0.0.0.0:7777",
  mainAppPath = `${fileTestUtil.submissionDir}/app.js`,
  moduleDir = fileTestUtil.submissionDir,
  timeoutMillis = 45000
) => {
  const nonAllowedLibraries = listNonWhitelistedLibraries(moduleDir);
  if (nonAllowedLibraries.length > 0) {
    Deno.test("Using unsupported library versions. Check the materials for current and updated library versions.", async () => {
      await assert(false, nonAllowedLibraries.toString());
    });

    return;
  }

  // look for app.js in the submission directory
  if (!existsSync(mainAppPath)) {
    let expectedPath = mainAppPath.replace("/app/submission", "");
    Deno.test(`Could not find the main app (often app.js) at ${expectedPath} of the submission`, async () => {
      await assert(false, "If this is a zip submission, check e.g. that the main file (often app.js) is in the root directory of the zip unless otherwise instructed.");
    });

    return;
  }

  const server = await startServer(mainAppPath, serverUrl, moduleDir);

  let testsDone = 0;
  const emitTestDone = async (error: any) => {
    testsDone = testsDone + 1;
    if (testsDone >= tests.length) {
      await stopServer(server);
    }

    if (error) {
      const appError = await stopServer(server).catch(error => error)
      throw `${error}\n\n${appError ?? ''}`
    }
  };

  tests.forEach((test: any) => {
    Deno.test({
      name: test.name,

      // Whenever a test has been finished, check if all the tests were run -- if yes,
      // stop the server
      // TODO: possible threading problem?
      fn: () => deadline(() => test.fn(), test.timeoutMillis ?? timeoutMillis).then(emitTestDone, emitTestDone),
      // fn: () => test.fn().then(emitTestDone, emitTestDone),

      // We need to set these options to false such that the test can exit with status 0
      sanitizeOps: false,
      sanitizeResources: false,
    });
  });
};

class DeadlineError extends Error {
  constructor(...params: any[]) {
    super(...params)
  }
}

// Move to async utils?
const timeout = (prom, time, exception) => {
	let timer;
	return Promise.race([
		prom,
		new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
	]).finally(() => clearTimeout(timer));
}

const deadline = async (f, timeoutMillis) => {
  const timeoutError = new DeadlineError(`Timeout after ${timeoutMillis / 1000} seconds.`);
  return await timeout(f(), timeoutMillis, timeoutError);
}

const timeoutFetch = async (url, options) => {
  const defaultTimeout = 3000;
  const timeoutMillis = options.timeoutMillis ?? defaultTimeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMillis);

  let response = await fetch(url, {
    ...options, signal: abortController.signal
  }).catch((error) => {
    if(error instanceof DOMException && error.name === 'AbortError') {
      throw new DeadlineError(`Request timeout after ${timeoutMillis / 1000} seconds.`);
    }
    throw error
  });
  clearTimeout(timeoutId);
  return response;
}

const serverTestUtil = {
  waitForServerStartUp,
  runTests,
  fetch: timeoutFetch
};

export default serverTestUtil;
