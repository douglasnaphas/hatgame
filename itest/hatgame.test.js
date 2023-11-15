const {
  CloudFormationClient,
  DescribeStacksCommand,
} = require("@aws-sdk/client-cloudformation");
const stackname = require("@cdk-turnkey/stackname");
const STACKNAME_HASH_LENGTH = 6;
const randomLowercaseString = (len) => {
  const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
  let s = "";
  while (s.length < len) {
    s += Math.floor(Math.random() * ALPHABET.length);
  }
  return s;
};

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
    const taskMasterName = randomLowercaseString(3);
    await page.type("xpath/" + taskMasterNameXPath, taskMasterName);
    await page.click("xpath/" + '//input[@id="virtually"]');
    const generateRoomCodeXPath = '//input[@id="generate-room-code-button"]';
    await page.click("xpath/" + generateRoomCodeXPath);
    const yourRoomCodeH1XPath = '//h1[text()="Your room code"]';
    await page.waitForXPath(yourRoomCodeH1XPath);
    const yourRoomCodeURL = new URL(await page.url());

    // the displayed room code should match the last path part
    const roomCodeFromBody = await page.$("#room-code").innerText;
    expect(roomCodeFromBody).toEqual(yourRoomCodeURL.pathname.split("/")[2]);

    // the leader's name should be the only one in the list of participants
    const firstParticipantName = await page.$x(
      "//div[@id='players-in-the-room']//ol/li[1]"
    ).innerText;
    expect(firstParticipantName).toEqual(taskMasterName);
    const playerLiXPath =
      "//div[@id='players-in-the-room']//ol[@id='player-list']/li";
    const playerCount = (await page.$x(playerLiXPath)).length;
    expect(playerCount).toEqual(1);

    // join

    // player 1's name should be in the list of participants
  }, 300000);

  test("room codes should differ", async () => {
    const roomCode1 = "";
  });
});
