const express = require('express');
const config = require('./config');
const app = express();

app.use(express.static(__dirname + '/html'));
app.get('/', (req, res) => res.sendFile(__dirname + 'html/index.html'));
app.get('/hello', (req, res) => res.sendFile(__dirname + '/html/hello.html'));
app.get('/world', (req, res) => res.sendFile(__dirname + '/html/world.html'));
app.get('*', (req, res) => res.sendFile(__dirname + '/html/404.html'));

app.listen(config.port);
console.log(`Server started on port ${config.port}\n`);
