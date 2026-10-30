const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const auth = require('./router/auth_users.js');
const customer_routes = auth.authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
  secret: process.env.SESSION_SECRET || "fingerprint_customer",
  resave: false,
  saveUninitialized: false
}));

app.use("/customer/auth/*", function authenticate(req, res, next) {
  const authorization = req.get("authorization");
  const bearerToken = authorization && authorization.match(/^Bearer\s+(.+)$/i);
  const token = (req.session.authorization && req.session.authorization.accessToken)
    || (bearerToken && bearerToken[1]);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, auth.JWT_SECRET);
    if (typeof decoded.username !== "string" || !auth.isValid(decoded.username)) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.username = decoded.username;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired authentication token" });
    }
    return next(error);
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
