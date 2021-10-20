import puppeteer, { ElementHandle } from "puppeteer";
import PageProps from "../../../../@types/page-props";
import { getProperty } from "../../../../common";

export async function projectScrape(page: puppeteer.Page) {
  const selector = `script#__NEXT_DATA__[type="application/json"]`;
  await page.waitForSelector(selector);
  const propsHandler = (await page.$(selector)) as ElementHandle<Element>;
  const propsRawString = await getProperty(propsHandler, "textContent");
  const { props } = JSON.parse(propsRawString) as PageProps;
  const token = props.initialProps.pageProps.info;
  delete token.platforms;
  delete token.relatedCoins;
  delete token.relatedExchanges;
  delete token.wallets;
  delete token.holders;
  console.log(`got ${token.name}`);
  return token;
}
