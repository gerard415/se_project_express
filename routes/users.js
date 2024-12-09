const router = require("express").Router();

const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateUserUpdate } = require("../middlewares/validation");

router.get("/me", validateUserUpdate, getCurrentUser);
router.patch("/me", updateUser);

module.exports = router;