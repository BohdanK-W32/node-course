const axios = require('axios');
const fs = require('fs');

const darkSkyUrl = ({ lat, lng, lang, units }) =>
  `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${lat},${lng}?lang=${lang}&units=${units}`;

module.exports = async ({ lat, lng, lang = 'en', units = 'si' }) => {
  const weather = await axios(darkSkyUrl({ lat, lng, lang, units })).catch(err => new Error(err));

  return weather.data;
};
