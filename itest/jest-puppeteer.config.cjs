// jest-puppeteer.config.cjs

/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.HEADLESS !== "false" ? "new" : false,
    product: "chrome",
  },
  browserContext: "default",
};