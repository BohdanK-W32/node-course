const mongoose = require('mongoose');
const connectDb = () => mongoose.connect(process.env.SHORT_LINK_DB, { useNewUrlParser: true });

module.exports = connectDb;
