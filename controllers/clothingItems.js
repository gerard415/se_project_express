const ClothingItem = require("../models/clothingItem");
const {
  NOT_FOUND,
  SERVER_ERROR,
  BAD_REQUEST,
  FORBIDDEN
} = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  })
    .then((item) => res.send(item))
    .catch((e) => {
      if (e.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: e.message });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

const getItems = (req, res) => {
  ClothingItem.find()
    .then((items) => {
      res.send(items);
    })
    .catch((e) => {
      console.error(e);
      res.status(SERVER_ERROR).send({ message: "An error has occurred on the server." });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error("item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        const error = new Error("Forbidden");
        error.statusCode = FORBIDDEN;
        throw error;
      }
      return ClothingItem.findByIdAndRemove(itemId);
    })
    .then(() => res.send({ message: "Item deleted" }))
    .catch((e) => {
      console.error(e.name);
      if (e.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Bad Request" });
      }
      if (e.statusCode === NOT_FOUND || e.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found" });
      }
      if (e.statusCode === FORBIDDEN) {
        return res.status(FORBIDDEN).send({ message: "Forbidden" });
      }
      return res.status(SERVER_ERROR).send({ message: "An error has occurred on the server." });
    });
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => res.send(item))
    .catch((e) => {
      console.log(e.name);
      if (e.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found" });
      }
      if (e.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Bad Request" });
      }
      if (e.statusCode === NOT_FOUND) {
        return res.status(NOT_FOUND).send({ message: "Requested resource not found" });
      }
      return res.status(SERVER_ERROR).send({ message: "An error has occurred on the server." });
    });
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => res.send(item))
    .catch((e) => {
      console.log(e.name);
      if (e.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Bad Request" });
      }
      if (e.name === "DocumentNotFoundError" || e.statusCode === NOT_FOUND) {
        return res
          .status(NOT_FOUND)
          .send({ message: "Requested resource not found" });
      }

      return res.status(SERVER_ERROR).send({ message: "An error has occurred on the server." });
    });
};

module.exports = { createItem, getItems, deleteItem, likeItem, dislikeItem };