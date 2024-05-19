const express = require('express');
const validUrl = require('valid-url');

const app = express();
const port = 3000;


const urlDatabase = {};
const urlStats = {};

app.use(express.json());

const getNanoid = async () => {
  const { nanoid } = await import('nanoid');
  return nanoid;
};


app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl || !validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const nanoid = await getNanoid();
  const shortId = nanoid(6);
  const shortUrl = `http://localhost:${port}/${shortId}`;

  urlDatabase[shortId] = { longUrl, shortUrl };
  urlStats[shortId] = { visits: 0, lastAccess: null };

  res.status(201).json({ shortUrl });
});


app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;

  if (!urlDatabase[shortId]) {
    return res.status(404).json({ error: 'URL not found' });
  }

  urlStats[shortId].visits += 1;
  urlStats[shortId].lastAccess = new Date();

  res.redirect(301, urlDatabase[shortId].longUrl);
});


app.get('/stats/:shortId', (req, res) => {
  const { shortId } = req.params;

  if (!urlDatabase[shortId]) {
    return res.status(404).json({ error: 'URL not found' });
  }

  res.json(urlStats[shortId]);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`URL shortener server running at http://localhost:${port}`);
});
