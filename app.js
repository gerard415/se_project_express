require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errors } = require("celebrate");

const { requestLogger, errorLogger } = require('./middlewares/logger');
const mainRouter = require("./routes/index");
const auth = require("./middlewares/auth");
const { login, createUser } = require("./controllers/users");
const { getItems } = require("./controllers/clothingItems");
const errorHandler = require("./middlewares/error-handler");
const { validateLogin, validateUserInfo } = require('./middlewares/validation');

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());
app.use(cors())

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.post("/signin", validateLogin, login);
app.post("/signup", validateUserInfo, createUser);
app.get("/items", getItems);

app.use(auth)
app.use("/", mainRouter);

app.use(errorLogger);
app.use(errors())
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
