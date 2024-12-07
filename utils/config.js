const { JWT_SECRET = "superstrongpassword" } = process.env;

module.exports = JWT_SECRET;