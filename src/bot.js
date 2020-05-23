const path = require('path');
const { Telegraf, Extra } = require('telegraf');
const TelegrafI18n = require('telegraf-i18n');
const UserModel = require('./models/user');
const fetchWeather = require('./config/fetchWeather');
const config = require('./config/config');
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

const getName = user => user.first_name || user.last_name || user.username;

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
    isNewUser
      ? reply(i18n.t('hello', { name: getName(from) }), locationMenu(i18n.t('send_location_btn')))
      : reply(i18n.t('lang_changed'), locationMenu(i18n.t('send_location_btn')));
  };

  await setUserLang(chat.id, match, replyLangChanged);

  return next();
};

const langMenu = Extra.markdown().markup(m =>
  m
    .inlineKeyboard([m.callbackButton('🇺🇸', EN_LANG), m.callbackButton('🇺🇦', UA_LANG), m.callbackButton('🇷🇺', RU_LANG)])
    .resize()
);

const locationMenu = text => {
  return Extra.markup(markup => {
    return markup.resize().keyboard([markup.locationRequestButton(text)]);
  });
};

const changeLangMessage = async replyMethod =>
  await replyMethod('Choose your language / оберіть мову / выберите язык', langMenu);

//
// Bot start
//

if (process.env.HEROKU) {
  bot.telegram.setWebhook(`${TELEGRAM_WEATHER_BOT_WEBHOOK}/${TELEGRAM_WEATHER_BOT_TOKEN}`);
  bot.startWebhook(`/bot${TELEGRAM_WEATHER_BOT_TOKEN}`, null, config.port);
  app.use(bot.webhookCallback(`/${process.env.TELEGRAM_WEATHER_BOT_TOKEN}`));
}

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

bot.on('location', async ({ i18n, reply, from, message }) => {
  const { latitude: lat, longitude: lng } = message.location;
  await UserModel.findOne({ user_id: from.id }, (err, res) => {
    if (err) return new Error(err);
    if (res) i18n.locale(res.lang);
  });

  await fetchWeather({ lat, lng, lang: i18n.locale() }).then(res => {
    reply(i18n.t('weather_message', { ...res }), Extra.HTML(true)).catch(err => console.error(new Error(err)));
  });
});

module.exports = bot;
