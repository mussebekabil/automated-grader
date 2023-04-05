const promiseWithTimeout = async (timeoutMs: number, promise: () => any) => {
  let timeoutHandle: number;
  const timeoutPromise = new Promise((resolve) => {
    timeoutHandle = setTimeout(resolve, timeoutMs);
  });
  return await Promise.race([
    promise(),
    timeoutPromise,
  ]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  });
};

const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const asyncTestUtil = {
  promiseWithTimeout,
  sleep,
};

export default asyncTestUtil;
