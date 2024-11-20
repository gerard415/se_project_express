const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  NOT_FOUND,
  SERVER_ERROR,
  BAD_REQUEST,
  UNAUTHORIZED,
  CONFLICT
} = require("../utils/errors");
const JWT_SECRET = require("../utils/config");


const getCurrentUser = (req, res) => {
  User.findById(req.user.userId)
    .then((data) => res.send({ data }))
    .catch((e) => {
      console.log(e.name);
      return res.status(SERVER_ERROR).send({ message: "User not found" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and Password are required" });
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(CONFLICT)
          .send({ message: "Account with Email already exists" });
      }
      return bcrypt.hash(password, 10).then((pass) => User.create({ name, avatar, email, password: pass })
          .then((data) => res.send({
              data: { name: data.name, avatar: data.avatar, email: data.email },
            })));
    })
    .catch((e) => {
      console.log(e);
      if (e.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Validation Error from createUser" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "Error from createUser" });
    });
};

const updateUser = (req, res) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(req.user.userId, { name, avatar }, { new: true, runValidators: true })
    .then((data) => res.send(data))
    .catch((e) => {
      console.log(e.name);
      if (e.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid request" });
      }
      if (e.name === "NotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.status(SERVER_ERROR).send({ message: "Error, User not found" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and Password are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.send({
        token,
        user: {
          name: user.name,
          _id: user._id,
          avatar: user.avatar,
          email: user.email,
        },
      });
    })
    .catch((e) => {
      console.error(e.message);
      if (e.message === "Invalid email or password") {
        return res
          .status(UNAUTHORIZED)
          .send({ message: "Invalid email or password" });
      }
      return res.status(SERVER_ERROR).send({ message: "500 Error from login" });
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};