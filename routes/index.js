const router = require('express').Router();
const shortId = require('shortid');
const LinkModel = require('../models/link');

// POST /short
router.post('/short', async (req, res) => {
  const { link } = req.body;

  try {
    let url = await LinkModel.findOne({ link });

    if (url) return res.json(url);

    const code = shortId.generate();
    const shortUrl = `${process.env.DOMAIN_NAME}/${code}`;
    url = LinkModel({ code, source: link, short: shortUrl });

    await url.save();
    return res.json(url);
  } catch (err) {
    return res.status(500).json({ status: 500, message: JSON.stringify(err) });
  }
});

// GET /:code
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  let link = await LinkModel.findOne({ code });

  if (link) return res.redirect(link.source);

  return res.status(404).json({ status: 404, message: 'Link not found' });
});

// GET /
router.get('/', async (req, res) => {
  const recentlyAddedLinks = await LinkModel.find().sort({ date: -1 }).limit(10);

  return res.render('index', { links: recentlyAddedLinks || [] });
});

module.exports = router;
