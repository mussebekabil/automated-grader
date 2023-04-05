import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const createPuppeteerBrowser = async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "/deno-dir/deno_puppeteer/chromium/linux-1022525/chrome-linux/chrome",
      // when puppeteer is updated, the above path also needs to be updated
      // -- you can find correct path for the chrome in the deno-grader image
    args: [
      // Required for Docker version of Puppeteer
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--headless",
      "--disable-gpu",
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      "--disable-dev-shm-usage",
    ],
  });

  return browser;
};

export { createPuppeteerBrowser };