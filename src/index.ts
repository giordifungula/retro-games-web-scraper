import express from 'express';
import bodyParser from 'body-parser';
import cliProgress from 'cli-progress';
import colours from 'ansi-colors';
import { platformSelector } from './helper';
import { saveGameData } from './database';

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// START: Controllers //
import scrapeRetroGamesContent from './controllers/retro-games';
import scrapeWikipediaContent from './controllers/wikipedia';
// END: Controllers //

app.post('/database/connection', async (req, res) => {
  try {
    await saveGameData({
      title: "Test Game Title",
      plot: "Test Game Plot",
      genres: ["genre-title", "genre-title-2"],
      publishers: ["publishers-title", "publisher-title-2"],
      releaseDate: "Test Date",
      imageUrl: "Test Image URL",
      iframeSrc: "Test iframe",
      relatedGames: [
        {
          title: "test title",
          imgSrc: "test image src"
        },
        {
          title: "test title 2",
          imgSrc: "test image src 2"
        }
      ]
    });
    res.json({success: true});
  } catch (error: any) {
    console.error(`Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
})

app.post('/scrape-retro-games', async (req, res) => {
  let { pageCount, platform } = req.body;
  try {
    let games = [];
    pageCount = pageCount + 1;
    const platformName: string = platform;
    platform = platformSelector(platform);
    for (let i = 1; i < pageCount; i++) {
      const url = `https://www.retrogames.cc/${platform}/page/${i}.html`;
      const list = await scrapeRetroGamesContent(url, platform, i, pageCount-1);
      const progressBar = new cliProgress.SingleBar({
        format: `Saving to the database: ` + colours.cyan('{bar}') + '| {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      }, cliProgress.Presets.shades_classic);
      const listLength = list.length === 50 ? list.length * 2 : list.length
      progressBar.start(listLength, 0);
      for (let i = 0; i < list.length; i++) {
        const game = list[i];
        const details = await scrapeWikipediaContent(game.title);
        await saveGameData({ ...game, ...details, platform: platformName });
        games.push({ ...game, ...details });
        progressBar.update(listLength === 50 ? 1 : (i / list.length) * 100);
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
