const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCurrentUserInfo, updateCurrentUserInfo } = require('../controllers/user');

router.get('/me', getCurrentUserInfo);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required().min(5)
        .max(30),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  updateCurrentUserInfo,
);

module.exports = router;
