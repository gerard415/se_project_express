const router = require("express").Router();
const userRouter = require("./users");
const itemsRouter = require("./clothingItems")
const { NOT_FOUND } = require("../utils/errors");

router.use("/users", userRouter);
router.use("/items", itemsRouter)

router.use((req, res) =>
  res.status(NOT_FOUND).send({ message: "Requested resource not found" })
);

module.exports = router;