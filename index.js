require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const app = express();
const config = require('./config/config');
const connectDb = require('./config/db');
const defaultRoutes = require('./routes');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(defaultRoutes);

connectDb()
  .then(() => {
    app.listen(config.port, () => {
      const date = new Date();
      console.log(
        `It works on port ${process.env.PORT || config.port}. ${date.getHours() < 10 ? '0' : ''}${date.getHours()}:${
          date.getMinutes() < 10 ? '0' : ''
        }${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()} ${
          date.getDate() < 10 ? '0' : ''
        }${date.getDate()}.${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}.${date.getFullYear()}`
      );
    });
  })
  .catch(err => console.error(err));

setInterval(() => http.get(`http://${process.env.DOMAIN_NAME}`), 180000);
