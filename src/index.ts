import express from 'express';
import bodyParser from 'body-parser';
import cliProgress from 'cli-progress';
import colours from 'ansi-colors';
import { platformSelector } from './helper';

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// START: Controllers //
import scrapeRetroGamesContent from './controllers/retro-games';
import scrapeWikipediaContent from './controllers/wikipedia';
// END: Controllers //

app.post('/scrape-retro-games', async (req, res) => {
  let { pageCount, platform } = req.body;
  try {
    let games = [];
    pageCount = pageCount + 1
    platform = platformSelector(platform);
    for (let i = 1; i < pageCount; i++) {
      const url = `https://www.retrogames.cc/${platform}/page/${i}.html`;
      const list = await scrapeRetroGamesContent(url, platform, i, pageCount-1);
      const bar = new cliProgress.SingleBar({
        format: `Retrieving additional content for pg. ${i}: ` + colours.cyan('{bar}') + '| {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      }, cliProgress.Presets.shades_classic);
      bar.start(list.length, 0);
      for (let i = 0; i < list.length; i++) {
        const game = list[i];
        const details = await scrapeWikipediaContent(game.title);
        games.push({ ...game, ...details });
        bar.update((i / list.length) * 100);
      }
    }
    res.json({games});
  } catch (error) {
    console.error(`Error scraping ${platform} games:`, error);
    res.status(500).json({ error: 'Failed to scrape PSX games' });
  }
}); 

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
