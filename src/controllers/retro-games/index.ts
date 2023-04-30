import puppeteer, { Browser, Page } from "puppeteer";
import cliProgress from 'cli-progress';
import colours from 'ansi-colors';
interface RetroGames {
    id?: number;
    title: string;
    url: string;
    iframeSrc?: string | null;
    relatedGames?: Array<{ 
      title: string | null; 
      imgSrc: string | null
    }> 
}
  
export default async function scrapeRetroGamesContent(url: string, platform: string, pageNumber: number, pageLength: number): Promise<RetroGames[]> {
    console.log("Preparing to scrape...");
    
    const browser: Browser = await puppeteer.launch({ headless: "new" });
    const page: Page = await browser.newPage();
  
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  
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
    const bar = new cliProgress.SingleBar({
      format: `Retrieving pg. ${pageNumber} out of ${pageLength}: ` + colours.cyan('{bar}') + '| {percentage}% || {value}/{total}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    }, cliProgress.Presets.shades_classic);
    bar.start(games.length, 0);
    for (let i = 0; i < games.length; i++) {
      const singleGame = await scrapeIframeSrc(games[i].url);
      games[i].iframeSrc = singleGame.iframeSrc;
      games[i].relatedGames = singleGame.relatedGames;
      bar.update(1);
      console.log('\n',games[i].title);
    }
    bar.stop();
    await browser.close();
    return games;
}

async function scrapeIframeSrc(url: string): Promise<{
    iframeSrc: string | null;
    relatedGames: Array<{ 
      title: string | null; 
      imgSrc: string | null
    }>
}> {
    const browser: Browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const relatedGames = await page.$$eval('.item', (items) => {
        return items.map((item) => {
          if(item?.querySelector('h6 a')) {
            const title = item.querySelector('h6 a')?.textContent || '';
            const imgSrc = item.querySelector('.post-thumb img')?.getAttribute('src') || '';
            return { title, imgSrc };
          }
          else {
            return { title: null, imgSrc: null };
          }
        });
    });
  
    const iframeSrc = await page.$eval('textarea', (textarea) => {
      const text = textarea.textContent;
      if (!text) return '';
  
      const srcMatch = text.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : null;
    });
  
    await browser.close();
    return {
        iframeSrc, 
        relatedGames
    };
}