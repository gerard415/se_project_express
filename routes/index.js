const router = require("express").Router();
const userRouter = require("./users");
const itemsRouter = require("./clothingItems")
const { NotFoundError } = require("../errors/notfounderror");

router.use("/users", userRouter);
router.use("/items", itemsRouter)

router.use(() => {
  throw new NotFoundError('Resource not found')
});

module.exports = router;