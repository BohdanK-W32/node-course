const axios = require('axios');

const darkSkyUrl = ({ lat, lng, lang }) =>
  `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${lat},${lng}?lang=${lang}&units=si`;

module.exports = async ({ lat, lng, lang = 'en' }) => {
  try {
    const weather = await axios(darkSkyUrl({ lat, lng, lang }));

    return weather.data;
  } catch (err) {
    console.error(new Error(err));
  }
};
