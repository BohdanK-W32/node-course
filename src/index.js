require('dotenv').config();

const app = require('express')();
const { port } = require('./config/config');
const db = require('./config/db');
const bot = require('./bot');

db();

bot.launch();

app.all('*', (req, res) => res.end('Ok, so what?'));
app.listen(port, () => console.log('Ok, we are on ' + port + ' port'));
