const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JWT_SECRET = require("../utils/config");
const { NotFoundError } = require("../errors/notfounderror");
const { BadRequestError } = require("../errors/badrequesterror");
const { ConflictError } = require('../errors/conflicterror');
const { UnauthorizedError } = require('../errors/unauthorizederror');


const getCurrentUser = (req, res, next) => {
  User.findById(req.user.userId)
    .then((data) => res.send({ data }))
    .catch(() => {
      next( new NotFoundError("User not found"))
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    next( new BadRequestError('Email and password are required'));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        next( new ConflictError('Account with email already exists'));
      }
      return bcrypt.hash(password, 10).then((pass) => User.create({ name, avatar, email, password: pass })
          .then((data) => res.send({
              data: { name: data.name, avatar: data.avatar, email: data.email },
            })));
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next( new BadRequestError('Bad Request'));
      }
      next(err)
    });
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(req.user.userId, { name, avatar }, { new: true, runValidators: true })
    .then((data) => res.send(data))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next( new BadRequestError('Invalid Request'));
      }
      if (err.name === "NotFoundError") {
        next( new NotFoundError("User not found"))
      }
      next(err)
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next( new BadRequestError('Email and password are required'));
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
    .catch((err) => {
      if (err.message === "Invalid email or password") {
        next( new UnauthorizedError("Invalid email or password"))
      }
      next(err)
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};