import puppeteer from "puppeteer";

export default function scraperBootload(target: Promise<puppeteer.Target>) {
  const destination = new URL(process.argv[2]);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    target

      .then((target) => target.page()) // .browserContext().newPage();
      .then((page) => page?.goto(destination.href, { waitUntil: "networkidle2" }));
  }
}
