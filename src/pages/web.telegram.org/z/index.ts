import puppeteer from "puppeteer";
/**
 *
 * "jimp": "^0.16.1",
    "jquery": "^3.6.0",
    "jsqr": "^1.4.0",
    "qr-code-scanner-typescript": "^1.0.10",
    "qr-scanner": "^1.3.0",
    "qrcode-decoder": "^0.2.2",
    "qrcode-reader": "^1.0.4",
 */
export default async (browser: puppeteer.Browser) => {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }

  const container = await page.waitForSelector(`canvas`);
  await waitForTransitionEnd(`#auth-qr-form > div > div`);
  const canvas = await page.$(`canvas`);
  //   const result = await page.evaluate(pageLogic);
  //   console.log({ result });
  const IMAGE_PATH = "dist/pages/web.telegram.org/z/index.png";

  await canvas?.screenshot({ path: IMAGE_PATH });
  await import("./jimp");

  await page.close();
  await browser.close();
  process.exit(0);

  async function waitForTransitionEnd(querySelector: string) {
    return await page.evaluate((qS) => {
      return new Promise((resolve) => {
        const transition = document.querySelector(qS);
        const onEnd = function () {
          transition.removeEventListener("transitionend", onEnd);
          resolve(transition);
        };
        transition.addEventListener("transitionend", onEnd);
      });
    }, querySelector);
  }
};

// async function pageLogic() {
//   //   const qr = new QrcodeDecoder();

//   //   const result = await qr.decodeFromImage(IMAGE_PATH);
//   const qr = new QrcodeDecoder();
//   const qrCode = document.querySelector(`canvas`);
//   //   @ts-ignore
//   const imageData = qr._createImageData(qrCode, qrCode.width, qrCode.height);
//   return await qr.decodeFromImage(imageData);
// }

function phoneLoginHalfImplemented() {
  const PHONE_NUMBER = process.env.TELEGRAM_PHONE_NUMBER;
  if (!PHONE_NUMBER) {
    throw new Error("TELEGRAM_PHONE_NUMBER is not defined");
  }
  return async (browser: puppeteer.Browser) => {
    const pages = await browser.pages();
    const page = pages[pages.length - 1];
    if (!page) {
      throw new Error("No page found");
    }

    const phoneLogin = await page.waitForSelector(`#auth-qr-form > div > button`);
    //   setTimeout(async () => {
    await phoneLogin?.click();
    const phoneInput = await page.waitForSelector(`#sign-in-phone-number`);
    await phoneInput?.type(PHONE_NUMBER);
    await phoneInput?.press("Enter");
    //   const container = await page.waitForSelector(`.qr-container`);
    //   await container?.screenshot({ path: "src/pages/web.telegram.org/z/index.png" });
    await page.close();
    await browser.close();
    process.exit(0);
    //   }, 1000);
  };
}
