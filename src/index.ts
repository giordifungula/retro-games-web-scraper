import express from 'express';
import bodyParser from 'body-parser';
import { platformSelector } from './helper';

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// START: Controllers //
import scrapeRetroGamesContent from '../src/controllers/retro-games';
import scrapeWikipediaContent from '../src/controllers/wikipedia';
// END: Controllers //

app.post('/scrape-retro-games', async (req, res) => {
  let { pageCount, platform } = req.body;
  try {
    let games = [];
    pageCount = pageCount + 1
    platform = platformSelector(platform);
    for (let i = 1; i < pageCount; i++) {
      const url = `https://www.retrogames.cc/${platform}/page/${i}.html`;
      const list = await scrapeRetroGamesContent(url, platform);
      for (let i = 0; i < list.length; i++) {
        const game = list[i];
        const details = await scrapeWikipediaContent(game.title);
        games.push({ ...game, ...details });
        console.log(games);
      }
    }
    res.json({games});
  } catch (error) {
    console.error('Error scraping PSX games:', error);
    res.status(500).json({ error: 'Failed to scrape PSX games' });
  }
}); 

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
