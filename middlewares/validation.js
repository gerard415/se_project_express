const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.required": 'The "name" field must be filled in',
    }),

    imageUrl: Joi.string().required().custom(validateURL).messages({
      "string.required": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid url',
    }),
    weather: Joi.string().valid('hot', 'warm', 'cold').required(),
  }),
});

const validateUserInfo = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.required": 'The "email" field must be filled in',
      "string.email": 'The "emal" field must be a valid email',
    }),
    password: Joi.string().required().min(8).messages({
      "string.required": 'The "password" field must be filled in',
      "string.min": 'The minimum length of the "password" field is 8',
    }),
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.required": 'The "name" field must be filled in',
    }),
    avatar: Joi.string().uri().required().custom(validateURL).messages({
      "string.required": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid url',
    }),
  })
})

const validateUserUpdate = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.required": 'The "name" field must be filled in',
    }),
    avatar: Joi.string().uri().required().custom(validateURL).messages({
      "string.required": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid url',
  })
})})

const validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "any.required": 'The "email" field must be filled in',
      "string.email": 'The "email" field must be a valid email',
    }),
    password: Joi.string().required().messages({
      "any.required": 'The "password" field must be filled in',
    }),
})})

const validateId = celebrate({
  params: Joi.object().keys({
    itemId: Joi.string().length(24).hex().required().messages({
      "string.length": 'The "id" field must be exactly 24 characters long',
      "string.hex": 'The "id" field must be a valid hexadecimal string',
      "any.required": 'The "id" field is required',
    }),
  }),
});

module.exports = {
  validateCardBody,
  validateLogin,
  validateId,
  validateUserInfo,
  validateUserUpdate,
};