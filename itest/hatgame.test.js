const {
  CloudFormationClient,
  DescribeStacksCommand,
} = require("@aws-sdk/client-cloudformation");
const stackname = require("@cdk-turnkey/stackname");
const STACKNAME_HASH_LENGTH = 6;

describe("Hat Game", () => {
  beforeAll(async () => {
    const appStackName = stackname("app", { hash: STACKNAME_HASH_LENGTH });
    const cloudFormationClient = new CloudFormationClient({
      region: "us-east-1",
    });
    const describeStacksResponse = await cloudFormationClient.send(
      new DescribeStacksCommand({
        StackName: appStackName,
      })
    );
    const webAppDomainName = describeStacksResponse.Stacks[0].Outputs.find(
      (output) => output.OutputKey === "WebAppDomainName"
    ).OutputValue;
    if (!webAppDomainName) {
      fail("Unable to get web app domain name.");
    }
    const url = `https://${webAppDomainName}`;
    await page.goto(url);
  });

  test("click through a game", async () => {
    const startARoomXPath = '//a[text()="Start a room"]';
    await page.waitForXPath(startARoomXPath);
    await page.click("xpath/" + startARoomXPath);
    const yesContinueXPath = '//a[text()="Yes, continue"]';
    await page.waitForXPath(yesContinueXPath);
    await page.click("xpath/" + yesContinueXPath);
    const roomNameXPath = '//input[@id="room-name"]';
    await page.waitForXPath(roomNameXPath);
    await page.type("xpath/" + roomNameXPath, "test room");
    const taskMasterNameXPath = '//input[@id="taskmaster-name"]';
    await page.type("xpath/" + taskMasterNameXPath, "test name");
    await page.click("xpath/" + '//input[@id="virtually"]');
    const generateRoomCodeXPath = '//input[@id="generate-room-code-button"]';
    await page.click("xpath/" + generateRoomCodeXPath);
    const yourRoomCodeH1XPath = '//h1[text()="Your room code"]';
    await page.waitForXPath(yourRoomCodeH1XPath);
  });
});
