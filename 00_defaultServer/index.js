const http = require('http');
const fs = require('fs');
const url = require('url');
const config = require('./config');

const renderHTML = (path, res) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Path error: ${req.url}`);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
};

http
  .createServer((req, res) => {
    console.log(`method: ${req.method} \npath: ${req.url} \n`);

    const path = url.parse(req.url).pathname;

    switch (path) {
      case '/':
        renderHTML('./index.html', res);
        break;

      case '/hello':
        renderHTML('./hello.html', res);
        break;

      case '/world':
        renderHTML('./world.html', res);
        break;

      default:
        renderHTML('./404.html', res);
    }
  })
  .listen(config.port);

console.log(`Server started on port ${config.port}\n`);
