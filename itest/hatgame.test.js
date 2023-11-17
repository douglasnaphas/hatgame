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
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
};
let appUrl;

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
    appUrl = `https://${webAppDomainName}`;
    await page.goto(appUrl);
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
    const ROOM_NAME_PREFIX = "rm-";
    const roomName = ROOM_NAME_PREFIX + randomLowercaseString(3);
    await page.type("xpath/" + roomNameXPath, roomName);
    const taskMasterNameXPath = '//input[@id="taskmaster-name"]';
    const TM_PREFIX = "tm-";
    const taskMasterName = TM_PREFIX + randomLowercaseString(3);
    await page.type("xpath/" + taskMasterNameXPath, taskMasterName);
    await page.click("xpath/" + '//input[@id="virtually"]');
    const generateRoomCodeXPath = '//input[@id="generate-room-code-button"]';
    await page.click("xpath/" + generateRoomCodeXPath);
    const yourRoomCodeH1XPath = '//h1[text()="Your room code"]';
    await page.waitForXPath(yourRoomCodeH1XPath);
    const yourRoomCodeURL = new URL(page.url());

    // the displayed room code should match the last path part
    const roomCodeFromBody = await page.$eval(
      "#room-code",
      (element) => element.textContent
    );
    expect(roomCodeFromBody).toEqual(yourRoomCodeURL.pathname.split("/")[2]);
    const roomCode = roomCodeFromBody;

    // the leader's name should be the only one in the list of participants
    const firstParticipantNameXPath =
      "//div[@id='players-in-the-room']//ol/li[1]";
    const [firstParticipantInList] = await page.$x(firstParticipantNameXPath);
    const firstParticipantIListText = await page.evaluate(
      (el) => el.textContent,
      firstParticipantInList
    );
    expect(firstParticipantIListText).toEqual(taskMasterName);
    const playerLiXPath =
      "//div[@id='players-in-the-room']//ol[@id='player-list']/li";
    let playerCount = (await page.$x(playerLiXPath)).length;
    expect(playerCount).toEqual(1);

    // join
    const P2_PREFIX = "p2-";
    const p2Name = P2_PREFIX + randomLowercaseString(4);
    const page2 = await browser.newPage();
    await page2.goto(appUrl);
    const joinARoomLinkXpath = '//a[text()="Join a room"]';
    await page2.click("xpath/" + joinARoomLinkXpath);
    const joinARoomHeaderXPath = '//h1[text()="Join a Room"]';
    await page2.waitForXPath(joinARoomHeaderXPath);
    const yourNameInputXPath = '//input[@id="your-name"]';
    await page2.type("xpath/" + yourNameInputXPath, p2Name);
    const roomSelectedText = async (pg) => {
      return await pg.$eval("#room-selected", (el) => el.textContent);
    };
    let currentRoomSelectText = await roomSelectedText(page2);
    expect(currentRoomSelectText.includes("None")).toBe(true);
    await page2.waitForXPath(`//*[@id="room-selected"][text()="🚫 None"]`);
    await page2.type("xpath/" + '//input[@id="room-code"]', roomCode);
    await page2.waitForXPath(
      `//*[@id="room-selected"][text()="✔️ ${roomName}"]`
    );
    // TODO: button should be disabled until a valid room code is present
    await page2.click(`xpath///input[@id="join-room-button"]`);

    // player 2's name should be in the list of participants
    playerCount = (await page.$x(playerLiXPath)).length;
    expect(playerCount).toEqual(2);
  }, 300000);

  test("room codes should differ", async () => {
    const roomCode1 = "";
  });
});
