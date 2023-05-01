import puppeteer, { Browser, Page } from 'puppeteer';
const googleIt = require('google-it');

interface GamePlot {
    plot: string | null;
    genres: string[];
    publishers: string[];
    releaseDate: string;
    imageUrl: string | null;
    reference: string | null;
}

export default async function scrapeWikipediaContent(gameTitle: string, platform: string): Promise<GamePlot | null>  {
    const browser: Browser = await puppeteer.launch({ headless: "new" });
    const page: Page = await browser.newPage();
    try {
      const searchResults = await googleIt({
        query: `${gameTitle} ${platform} game site:en.wikipedia.org`,
        disableConsole: true,
      });
  
      if (searchResults.length === 0) {
        await browser.close();
        return null;
      }
  
      const url = searchResults[0].link;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  
      const plotHeader = await page.$x("//h2/span[contains(., 'Plot')]");
      let plot: string | null = null;
  
      if (plotHeader.length > 0) {
        const plotElement = await plotHeader[0].evaluateHandle((header) => {
          const sibling = (header as HTMLElement).parentElement?.nextElementSibling;
          return sibling?.tagName === 'P' ? sibling : null;
        });
  
        if (plotElement) {
          plot = await (await plotElement.getProperty('textContent')).jsonValue() as string;
          plot = plot.trim();
        }
      }

      const genres = await page.$$eval('.infobox tr', (rows) => {
        const genreRow = rows.find((row: HTMLElement) => row.innerText.toLowerCase().includes('genre'));
        if (genreRow) {
          const genreLinks = genreRow.querySelectorAll('a');
          return Array.from(genreLinks).map((genreLink: HTMLElement) => genreLink.innerText);
        }
        return [];
      });

      if(genres.length > 0) {
        genres.shift();
      }

      const publishers = await page.$$eval('.infobox tr', (rows) => {
        const publisherRow = rows.find((row: HTMLElement) => row.innerText.toLowerCase().includes('publisher'));
        if (publisherRow) {
          const publisherLinks = publisherRow.querySelectorAll('a');
          return Array.from(publisherLinks).map((publisherLink: HTMLElement) => publisherLink.innerText);
        }
        return [];
      });

      if(publishers.length > 0) {
        publishers.shift()
      }

      const releaseDate = await page.$$eval('.infobox tr', (rows) => {
        const releaseRow = rows.find((row: HTMLElement) => row.innerText.toLowerCase().includes('release'));
        if (releaseRow) {
          const releaseDates = releaseRow.querySelectorAll('td div li');
          const naRelease = Array.from(releaseDates as NodeListOf<HTMLElement>).find((release: HTMLElement) => release.innerText.toLowerCase().includes('na'));
          return naRelease ? naRelease.innerText.replace(/.*:\s*/, '') : '';
        }
        return '';
      });

      const imageUrl: string | null = await page.$eval(
        'table.infobox img',
        (imgElement: HTMLImageElement) => imgElement.src,
        null
      ).catch(() => null);
      
      const reference = url;
      await browser.close();
      
      return { 
        plot,
        genres,
        publishers,
        releaseDate,
        imageUrl,
        reference
      };
    } catch (error) {
      await browser.close();
      return null;
    }
}