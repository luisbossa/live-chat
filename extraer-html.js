import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://127.0.0.7:5500/index.html", { waitUntil: "networkidle0" });

  // Esperar un par de segundos para que React renderice todo
  await new Promise(r => setTimeout(r, 2000));

  // Extraer HTML completo renderizado
  const html = await page.content();
  fs.writeFileSync("pagina-estatica.html", html);

  await browser.close();
})();