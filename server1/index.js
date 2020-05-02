const app = require('express')();

app.get('/', (res, req) => req.send('<h1>Aaaaaa (Hello world!)</h1>'));
app.listen(process.env.PORT, () => console.log('Just fckn simple server!'));
