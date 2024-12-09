const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");
const { UnauthorizedError } = require("../errors/unauthorizederror");

const handleAuthError = (next) => next(new UnauthorizedError("Authorization Required"));

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return handleAuthError(next)
  }

  const token = authorization.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return handleAuthError(next)
  }
  req.user = payload;
  return next();
};