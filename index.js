import { promises as fs } from "fs";
import * as theme from "jsonresume-theme-even";
import puppeteer from "puppeteer";
import { render } from "resumed";
import express from "express";

const PORT = 4000;

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

//serve static files
const fileName = "balazs_sevecsek.jpg";
const app = express();
app.use(express.static("public"));
const server = app.listen(PORT, () => {
  console.log(`static file server listening on port ${PORT}`);
});

const resumeJson = await fs.readFile("resume.json");
const resume = JSON.parse(resumeJson, "utf-8");
const html = await render(resume, theme);
const updatedHtml = html
  .replace(
    /<\/head>/,
    `
  <link href="/path/to/print.css" media="print" rel="stylesheet" />
  </head>`
  )
  .replace(/<img\s+[^>]*src="([^"]*)"[^>]*>/g, (match, p1) => {
    return match.replace(
      p1,
      `http://localhost:${PORT}/${fileName}`.replace(/\\/g, "/")
    );
  });

const browser = await puppeteer.launch({
  // headless: false,
});
const page = await browser.newPage();

await page.setContent(updatedHtml, { waitUntil: "networkidle0" });
await page.evaluate(() => {
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    if (!img.complete || img.naturalHeight === 0) {
      console.error(`Failed to load image: ${img.src}`);
    }
  });
});

//for debugging
// await sleep(1);
await fs.mkdir("./resume", { recursive: true });
await page.pdf({
  path: "./resume/balazs_sevecsek_resume.pdf",
  format: "a4",
  printBackground: true,
});
server.close();
await browser.close();
