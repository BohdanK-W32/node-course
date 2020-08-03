const path = require('path');
const moment = require('moment-timezone');
const { Telegraf, Extra } = require('telegraf');
const TelegrafI18n = require('telegraf-i18n');
const UserModel = require('./models/user');
const AdminModel = require('./models/admin');
const LocationModel = require('./models/location');
const { getName, filterTodayHourly, filterTomorrowHourly } = require('./utils');
const fetchWeather = require('./config/fetchWeather');
const icons = require('./config/icons.json');
const bot = new Telegraf(process.env.TELEGRAM_WEATHER_BOT_TOKEN);
const EN_LANG = 'en',
  UA_LANG = 'uk',
  RU_LANG = 'ru';

const I18n = new TelegrafI18n({
  defaultLanguage: 'en',
  useSession: true,
  sessionName: 'session',
  defaultLanguageOnMissing: true,
  directory: path.resolve(__dirname, 'locales'),
});

const setUserLang = async (userId, lang, replyLangChanged) => {
  try {
    let user = await UserModel.findOne({ user_id: userId });
    if (user) {
      replyLangChanged(lang, false);

      if (user.lang !== lang) {
        user.lang = lang;
        return await user.save();
      }
      return null;
    }

    replyLangChanged(lang, true);
    return await UserModel.create({ user_id: userId, lang });
  } catch (err) {
    return console.error('setUserLang error: ' + err);
  }
};

const langSelect = async ({ i18n, reply, from, chat, match }, next) => {
  const replyLangChanged = (lang, isNewUser) => {
    i18n.locale(lang);
    if (isNewUser) {
      reply(i18n.t('hello', { name: getName(from) }), locationMenu(i18n.t('send_location_btn')));
    } else {
      reply(i18n.t('lang_changed'), locationMenu(i18n.t('send_location_btn')));
    }
  };

  await setUserLang(chat.id, match, replyLangChanged);

  return next();
};

const getHourlyWeatherString = ({ data, timezone }) => {
  let weatherString = '';
  const timeString = time => moment.unix(time).tz(timezone).format('HH:mm');
  data.map(({ temperature, time, windSpeed, precipIntensity, precipProbability }) => {
    const temp = Math.round(temperature);
    weatherString += `<pre>${timeString(time)}  ${temp}°C ${temp < 10 ? ' ' : ''} ${windSpeed.toFixed(
      1
    )} m/s  ${precipIntensity.toFixed(1)} (${precipProbability * 100}%) mm/hg  </pre>\n`;
  });

  return weatherString;
};

const timeString = ({ time, timezone }) => moment.unix(time).tz(timezone).format('HH:mm');
const getDateString = (date, lang, format) => moment.unix(date).locale(lang).format(format);

const langMenu = Extra.markdown().markup(m =>
  m
    .inlineKeyboard([m.callbackButton('🇺🇸', EN_LANG), m.callbackButton('🇺🇦', UA_LANG), m.callbackButton('🇷🇺', RU_LANG)])
    .resize()
);

const locationMenu = text => Extra.markup(m => m.resize().keyboard([m.locationRequestButton(text)]));

const changeLangMessage = async replyMethod =>
  await replyMethod('Choose your language / оберіть мову / выберите язык', langMenu);

//
// Bot start
//

bot.use(I18n.middleware());
bot.use(Telegraf.session());

bot.start(async ({ reply }, next) => {
  await changeLangMessage(reply);

  return next();
});

bot.action(EN_LANG, langSelect);
bot.action(UA_LANG, langSelect);
bot.action(RU_LANG, langSelect);

bot.command('changelang', ({ reply }) => changeLangMessage(reply));

bot.command('send_all', async ({ i18n, reply, message, telegram, from }) => {
  const isAdmin = Boolean(await AdminModel.findOne({ user_id: from.id }));

  if (!from.is_bot && isAdmin) {
    const msg = message.text.slice(10, message.text.length);
    const isOwner = Boolean(await AdminModel.findOne({ user_id: from.id, is_owner: true }));
    const owner = await AdminModel.findOne({ is_owner: true });

    if (isOwner) {
      const allUsers = await UserModel.find({}, 'user_id', err => (err ? console.error(new Error(err)) : null));

      if (!allUsers[0].user_id) return reply(i18n.t('owner_get_db_failed'));

      allUsers.map(({ user_id }) => telegram.sendMessage(user_id, msg));
      return reply(i18n.t('owner_send_success'));
    }

    telegram.sendMessage(owner.user_id, i18n.t('owner_moderation', { name: getName(from), id: from.id }) + msg);
    return reply(i18n.t('moderation'));
  }

  return null;
});

// TODO Setup sending meessage to specific user
// FIXME Setup sending meessage to specific user
bot.command('send', async ({ i18n, reply, message, telegram, from }) => {
  const isOwner = Boolean(await AdminModel.findOne({ user_id: from.id, is_owner: true }));

  if (!isOwner) return reply('Error 401. Unauthorized');

  if (isOwner) {
    const msg = message.text.trim().slice(6, message.text.length).split(' ');
    const targetUserId = msg[0];

    return telegram
      .sendMessage(targetUserId, msg.splice(1).join(' '))
      .then(() => reply(i18n.t('owner_send_success')))
      .catch(({ response }) => reply(response.error_code + ' ' + response.description));
  }

  return null;
});

bot.command('coordinates', async ({ i18n, reply, from, message }) => {
  const msg = message.text.trim().slice(13, message.text.length).split(',');

  if (msg.length !== 2) return reply(i18n.t('coordinates_syntax_error'));

  const lat = msg[0].trim();
  const lng = msg[1].trim();

  await UserModel.findOne({ user_id: from.id }, (err, res) => {
    if (err) return new Error(err);
    if (res) i18n.locale(res.lang);
  });

  await LocationModel.create({ user_id: Number(from.id), location: { lat, lng } });

  await fetchWeather({ lat, lng, lang: i18n.locale() }).then(res => {
    const currently = { ...res.currently, icon: icons[res.currently.icon] };
    const today = {
      summary: res.daily.data[0].summary,
      sunriseTime: timeString({ time: res.daily.data[0].sunriseTime, timezone: res.timezone }),
      sunsetTime: timeString({ time: res.daily.data[0].sunsetTime, timezone: res.timezone }),
      icon: icons[res.daily.data[0].icon],
      data: getHourlyWeatherString({
        data: filterTodayHourly({ data: res.hourly.data, timezone: res.timezone }),
        timezone: res.timezone,
      }),
    };
    const tomorrow = {
      summary: res.daily.data[1].summary,
      sunriseTime: timeString({ time: res.daily.data[1].sunriseTime, timezone: res.timezone }),
      sunsetTime: timeString({ time: res.daily.data[1].sunsetTime, timezone: res.timezone }),
      icon: icons[res.daily.data[1].icon],
      data: getHourlyWeatherString({
        data: filterTomorrowHourly({ data: res.hourly.data, timezone: res.timezone }),
        timezone: res.timezone,
      }),
    };

    const weatherString = `${i18n.t('weather_message_currently', currently)}${
      today.data.length ? i18n.t('weather_message_today', today) : ''
    }${i18n.t('weather_message_tomorrow', tomorrow)}`;

    reply(weatherString, Extra.HTML(true)).catch(err => console.error(new Error(err)));
  });
});

bot.on('location', async ({ i18n, reply, from, message }) => {
  const { latitude: lat, longitude: lng } = message.location;

  await UserModel.findOne({ user_id: from.id }, (err, res) => {
    if (err) return new Error(err);
    if (res) i18n.locale(res.lang);
  });

  await LocationModel.create({ user_id: Number(from.id), location: { lat, lng } });

  await fetchWeather({ lat, lng, lang: i18n.locale() }).then(res => {
    const currently = { ...res.currently, icon: icons[res.currently.icon] };
    const today = {
      summary: res.daily.data[0].summary,
      sunriseTime: timeString({ time: res.daily.data[0].sunriseTime, timezone: res.timezone }),
      sunsetTime: timeString({ time: res.daily.data[0].sunsetTime, timezone: res.timezone }),
      icon: icons[res.daily.data[0].icon],
      data: getHourlyWeatherString({
        data: filterTodayHourly({ data: res.hourly.data, timezone: res.timezone }),
        timezone: res.timezone,
      }),
    };
    const tomorrow = {
      summary: res.daily.data[1].summary,
      sunriseTime: timeString({ time: res.daily.data[1].sunriseTime, timezone: res.timezone }),
      sunsetTime: timeString({ time: res.daily.data[1].sunsetTime, timezone: res.timezone }),
      icon: icons[res.daily.data[1].icon],
      data: getHourlyWeatherString({
        data: filterTomorrowHourly({ data: res.hourly.data, timezone: res.timezone }),
        timezone: res.timezone,
      }),
    };

    const weatherString = `${i18n.t('weather_message_currently', currently)}${
      today.data.length ? i18n.t('weather_message_today', today) : ''
    }${i18n.t('weather_message_tomorrow', tomorrow)}`;

    reply(weatherString, Extra.HTML(true)).catch(err => console.error(new Error(err)));
  });
});

module.exports = bot;
