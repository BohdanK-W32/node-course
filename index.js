const axios = require('axios');
const dotenv = require('dotenv');
const { Telegraf, Extra } = require('telegraf');

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const darkSkyUrl = ({ lat, lng, lang = 'en', units = 'si' }) =>
  `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${lat},${lng}?lang=${lang}&units=${units}`;

bot.start(({ reply, chat }) =>
  reply(
    `Welcome, ${chat.first_name}! \nSend me any location to get a current temperature in this location`,
    Extra.markup(markup => {
      return markup.resize().keyboard([markup.locationRequestButton('📍 Send location to get weather')]);
    })
  )
);

bot.help(({ reply }) =>
  reply(
    'Send me any location to get a current temperature in this location.',
    Extra.markup(markup => {
      return markup.resize().keyboard([markup.locationRequestButton('📍 Send location to get weather')]);
    })
  )
);

bot.on('location', ({ reply, message }) => {
  const { latitude: lat, longitude: lng } = message.location;
  return axios(darkSkyUrl({ lat, lng }))
    .then(({ data }) => reply(`${Number(data.currently.temperature).toFixed(1)}°C`))
    .catch(err => new Error(err));
});

bot.launch();
