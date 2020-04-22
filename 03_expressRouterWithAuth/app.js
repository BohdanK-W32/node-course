const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/config.json');
const router = require('./router');
const app = express();

// Custom auth middleware function
app.use((req, res, next) => {
  const requestKey = req.get('Authorization');
  if (requestKey === config.auth.token) return next();
  res.status(401).end();
});
app.use(express.static(__dirname + '/pages'));
app.use(bodyParser.json());
app.use('/', router);

app.listen(config.port);

console.log(`Server started on port ${config.port}\n`);
