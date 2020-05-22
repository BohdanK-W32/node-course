const mongoose = require('mongoose');
const db = mongoose.connection;

const connectDb = () => {
  mongoose.connect(process.env.DB_URL_WEATHER_BOT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => console.log('DB connected successfully'));
};

module.exports = connectDb;
