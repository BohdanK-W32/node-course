const express = require('express');
const app = express();
const router = require('./router');
const products = ['mongo', 'express', 'react', 'nodejs'];

app.get('/', (req, res) => res.send('It works'));
app.get('/products', (req, res) => res.json({ products }));
app.get('/products', req => console.log(`Page: ${req.query.page}`));
app.get('/products/:id', (req, res) => res.json(products[req.params.id]));

app.use('/books', router);

// app.set('view engine', 'pug'); // pug
// app.set('view engine', 'ejs'); // ejs
app.set('view engine', 'hbs'); // hbs
app.set('views', './views');

/* pug */
// app.get('/pug', (req, res, next) => {
//   res.render('main', { title: 'Pug template', message: 'Hello world!', products: products });
// });

/* ejs */
// app.get('/ejs', (req, res, next) => {
//   res.render('main', { title: 'EJS template', message: 'Hello world!', products: products });
// });

/* hbs */
app.get('/hbs', (req, res, next) => {
  res.render('main', { title: 'Handlebars template', message: 'Hello world!', products: products });
});

app.listen(3030, () => {
  const date = new Date();
  console.log(
    `It works. ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`
  );
});
