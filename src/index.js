require('dotenv').config();

const app = require('express')();
const { port } = require('./config/config');
const db = require('./config/db');
const bot = require('./bot');

db();

if (process.env.HEROKU) {
  app.use(bot.webhookCallback('/webhook'));
  bot.telegram.setWebhook(`${process.env.TELEGRAM_WEATHER_BOT_WEBHOOK}/webhook`);
}
bot.launch();

app.all('*', (req, res) => res.send('Ok, so what?').status(200).end());
app.listen(port, () => console.log('Ok, we are on ' + port + ' port'));
