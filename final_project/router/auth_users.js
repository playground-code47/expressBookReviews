const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const JWT_SECRET = process.env.JWT_SECRET || "access";

const isValid = (username) => users.some((user) => user.username === username);

const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string"
      || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  req.session.authorization = { accessToken: token };
  return res.status(200).json({ message: "User successfully logged in", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  const { review } = req.body || {};
  if (typeof review !== "string" || review.trim().length === 0) {
    return res.status(400).json({ message: "Review must be a non-empty string" });
  }

  const reviews = books[isbn].reviews;
  const updated = Object.prototype.hasOwnProperty.call(reviews, req.username);
  reviews[req.username] = review.trim();

  return res.status(updated ? 200 : 201).json({
    message: updated ? "Review updated" : "Review added",
    reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviews = books[isbn].reviews;
  if (!Object.prototype.hasOwnProperty.call(reviews, req.username)) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete reviews[req.username];
  return res.status(200).json({ message: "Review deleted", reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
