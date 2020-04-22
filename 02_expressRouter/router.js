const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.sendFile(__dirname + '/html/index.html'));
router.get('/hello', (req, res) => res.sendFile(__dirname + '/html/hello.html'));
router.get('/world', (req, res) => res.sendFile(__dirname + '/html/world.html'));
router.get('*', (req, res) => res.sendFile(__dirname + '/html/404.html'));

module.exports = router;
