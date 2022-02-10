const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCurrentUserInfo, updateCurrentUserInfo } = require('../controllers/user');

router.get('users/me', getCurrentUserInfo);

router.patch(
  'users/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  updateCurrentUserInfo,
);

module.exports = router;
