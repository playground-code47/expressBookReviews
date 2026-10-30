const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || username.trim().length === 0
      || typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const normalizedUsername = username.trim();
  if (isValid(normalizedUsername)) {
    return res.status(409).json({ message: "Username is already registered" });
  }

  users.push({ username: normalizedUsername, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLocaleLowerCase();
  const matches = Object.values(books).filter(
    (book) => book.author.toLocaleLowerCase() === author
  );
  return res.status(200).json(matches);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLocaleLowerCase();
  const matches = Object.values(books).filter(
    (book) => book.title.toLocaleLowerCase() === title
  );
  return res.status(200).json(matches);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
module.exports.getAllBooks = () =>
  axios.get(`${API_BASE_URL}/`).then((response) => response.data);
module.exports.getBookByISBN = (isbn) =>
  axios.get(`${API_BASE_URL}/isbn/${encodeURIComponent(isbn)}`).then((response) => response.data);
module.exports.getBooksByAuthor = (author) =>
  axios.get(`${API_BASE_URL}/author/${encodeURIComponent(author)}`).then((response) => response.data);
module.exports.getBooksByTitle = (title) =>
  axios.get(`${API_BASE_URL}/title/${encodeURIComponent(title)}`).then((response) => response.data);
