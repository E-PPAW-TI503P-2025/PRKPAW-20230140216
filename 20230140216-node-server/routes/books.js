 	const express = require('express');
 	const router = express.Router();
 	
 	let books = [
 	  {id: 1, title: 'Book 1', author: 'Author 1'},
 	  {id: 2, title: 'Book 2', author: 'Author 2'}
 	];
 	
 	router.get('/', (req, res) => {
 	  res.json(books);
 	});
 	
 	router.get('/:id', (req, res) => {
 	  const book = books.find(b => b.id === parseInt(req.params.id));
 	  if (!book) return res.status(404).send('Book not found');
 	  res.json(book);
 	});
 	
 	router.post('/', (req, res) => {
 	  const { title, author } = req.body;
 	  if (!title || !author) {
 	      return res.status(400).json({ message: 'title and author are required' });
 	  }
 	  const book = {
 	    id: books.length + 1,
 	    title,
 	    author
 	  };
 	  books.push(book);
 	  res.status(201).json(book);
 	});
 	
 	module.exports = router;
	// Update book
	router.put('/:id', (req, res) => {
		const { title, author } = req.body;
		const id = parseInt(req.params.id);
		const bookIndex = books.findIndex(b => b.id === id);
		if (bookIndex === -1) {
			return res.status(404).json({ message: 'Book not found' });
		}
		if (!title || !author) {
			return res.status(400).json({ message: 'title and author are required' });
		}
		books[bookIndex] = { id, title, author };
		res.json(books[bookIndex]);
	});

	// Delete book
	router.delete('/:id', (req, res) => {
		const id = parseInt(req.params.id);
		const bookIndex = books.findIndex(b => b.id === id);
		if (bookIndex === -1) {
			return res.status(404).json({ message: 'Book not found' });
		}
		const deletedBook = books.splice(bookIndex, 1);
		res.json({ message: 'Book deleted', book: deletedBook[0] });
	});
