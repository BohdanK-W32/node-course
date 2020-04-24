const router = require('express').Router();
const uuid = require('uuid/v4');

let books = [{ id: uuid(), author: 'Bohdan Kucheriavyi', title: 'Node.js' }];
const findBook = id => books.find(book => book.id == id);

router.get('/', (req, res) => res.json(books));
router.get('/:id', (req, res) => {
  const bookId = req.params.id;

  if (findBook(bookId)) return res.json(findBook(bookId));
  return res.status(404).json({ status: `book with id ${bookId} not found` });
});

router.post('/', (req, res) => {
  const book = {
    title: req.body.title || 'NONAME',
    author: req.body.author || 'Unknown',
    id: uuid(),
  };
  books.push(book);

  return res.status(200).json({ status: 'OK', book });
});

router.put('/:id', (req, res) => {
  const bookId = req.params.id;
  books.find(book => {
    if (bookId === book.id) {
      book.title = req.body.title || books[req.params.id].title;
      book.author = req.body.author || books[req.params.id].author;

      return res.status(200).json({ status: 'OK', book: book });
    }
  });
});

router.delete('/:id', (req, res) => {
  const bookId = req.params.id;

  books = books.filter(book => bookId != book.id);

  if (!findBook(bookId)) return res.status(200).json({ status: `Book with id ${bookId} was removed` });
  return res.status(400).json({ status: `Something wrong` });
});

module.exports = router;
