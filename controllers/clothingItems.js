const { BadRequestError } = require('../errors/badrequesterror');
const { ForbiddenError } = require('../errors/forbiddenerror');
const { NotFoundError }  = require('../errors/notfounderror');
const ClothingItem = require("../models/clothingItem");
const {
  NOT_FOUND,
  FORBIDDEN
} = require("../utils/errors");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user.userId,
  })
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next( new BadRequestError(err.message));
      }
      next(err)
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find()
    .then((items) => {
      res.send(items);
    })
    .catch((err) => {
      console.error(err);
      next(err)
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail(() => {
      next( new NotFoundError("Item not found"))
    })
    .then((item) => {
      if (item.owner.toString() !== req.user.userId) {
        return next( new ForbiddenError("You don't have permission to access this resource"));
      }
      return ClothingItem.findByIdAndRemove(itemId);
    })
    .then(() => res.send({ message: "Item deleted" }))
    .catch((err) => {
      if (err.name === "CastError") {
        next( new BadRequestError('Bad Request'));
      }
      if (err.statusCode === NOT_FOUND || err.name === "DocumentNotFoundError") {
        next( new NotFoundError('Item not found'));
      }
      if (err.statusCode === FORBIDDEN) {
        next( new ForbiddenError("You don't have permission to access this resource"));
      }
      next(err)
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user.userId } },
    { new: true }
  )
    .orFail(() => {
      next( new NotFoundError('Item not found'));
    })
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        next( new BadRequestError('Bad Request'));
      }
      if (err.name === "DocumentNotFoundError" || err.statusCode === NOT_FOUND) {
        next( new NotFoundError('Item not found'));
      }
      next(err)
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user.userId } },
    { new: true }
  )
    .orFail(() => {
      next( new NotFoundError('Item not found'));
    })
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        next( new BadRequestError('Bad Request'));
      }
      if (err.name === "DocumentNotFoundError" || err.statusCode === NOT_FOUND) {
        next( new NotFoundError('Item not found'));
      }

      next(err)
    });
};

module.exports = { createItem, getItems, deleteItem, likeItem, dislikeItem };