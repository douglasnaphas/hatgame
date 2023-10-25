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
    const distroDomainName = describeStacksResponse.Stacks[0].Outputs.find(
      (output) => output.OutputKey === "DistributionDomainName"
    ).OutputValue;
    if (!distroDomainName) {
      fail("Unable to get distro domain name.");
    }
    const url = `https://${distroDomainName}`;
    await page.goto(url);
  });

  test("click through a game", async () => {
    const startARoomXPath = '//a[text()="Start a room"]';
    await page.waitForXPath(startARoomXPath);
    await page.click("xpath/" + startARoomXPath);
    const yesContinueXPath = '//a[text()="Yes, continue"]';
    await page.waitForXPath(yesContinueXPath);
  });
});
