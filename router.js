const router = require('express').Router();

router.get('/about', (req, res) => res.send('About'));
router.get('/', (req, res) => res.send('Books'));

module.exports = router;