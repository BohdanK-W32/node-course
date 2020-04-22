const express = require('express');
const config = require('./config');
const router = require('./router');
const router1 = express.Router();
const app = express();

router1.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.use('/router', router1);
app.use('/', router);

app.listen(config.port);
console.log(`Server started on port ${config.port}\n`);
