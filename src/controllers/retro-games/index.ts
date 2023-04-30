import puppeteer, { Browser, Page } from "puppeteer";

interface RetroGames {
    id?: number;
    title: string;
    url: string;
    iframeSrc?: string;
    relatedGames?: Array<{ title: string; imgSrc: string}> 
}
  
export default async function scrapeRetroGamesContent(url: string, platform: string): Promise<RetroGames[]> {
    const browser: Browser = await puppeteer.launch({ headless: "new" });
    const page: Page = await browser.newPage();
  
    await page.goto(url, { waitUntil: 'networkidle2' });
  
    // Scrape game titles and URLs
    const games: RetroGames[] = await page.$$eval(
      `div.item > div.post > div.post-des > h6 > a[href*="/${platform}/"]`,
      (gameTitleElements: HTMLAnchorElement[]) =>
        gameTitleElements.map((element: any, i: number) => ({
          id: i + 1,
          title: element.textContent?.trim() || '',
          url: element.href,
        }))
    );
    for (let i = 0; i < games.length; i++) {
        const singleGame = await scrapeIframeSrc(games[i].url);
        games[i].iframeSrc = singleGame.iframeSrc;
        games[i].relatedGames = singleGame.relatedGames;
        console.log(games[i]);
    }
    
    await browser.close();
    return games;
}

async function scrapeIframeSrc(url: string): Promise<{
    iframeSrc: string;
    relatedGames: Array<{ title: string; imgSrc: string}>
}> {
    const browser: Browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const relatedGames = await page.$$eval('.item', (items) => {
        return items.map((item) => {
          const title = item.querySelector('h6 a')?.textContent || '';
          const imgSrc = item.querySelector('.post-thumb img')?.getAttribute('src') || '';
          return { title, imgSrc };
        });
    });
  
    const iframeSrc = await page.$eval('textarea', (textarea) => {
      const text = textarea.textContent;
      if (!text) return '';
  
      const srcMatch = text.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : '';
    });
  
    await browser.close();
    return {
        iframeSrc, 
        relatedGames
    };
}