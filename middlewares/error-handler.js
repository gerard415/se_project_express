module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Sorry, an error has occurred on the server."
      : err.message;

  console.error(err);
  res.status(statusCode).send({ message });
  next();
};