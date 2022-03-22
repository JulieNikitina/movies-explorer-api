const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const InternalError = require('../errors/internal-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getCurrentUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send({ user });
    })
    .catch(() => next(new InternalError()));
};

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  if (validator.isEmail(email) !== true) {
    next(new BadRequestError('То что вы ввели - не email'));
    return;
  }
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    })
      .then((user) => res.status(201).send({ user })))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы неверные данные'));
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError('У нас уже есть пользователь с таким email, ты точно еще не регистрировался?'));
      } else {
        next(new InternalError());
      }
    });
};

module.exports.updateCurrentUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        next(new NotFoundError('Пользователь не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы неверные данные'));
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError('Кто-то уже зарегистрировался с этим email'));
      } else {
        next(new InternalError());
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const hour = 3600000;
  const week = hour * 24 * 7;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
          domain: NODE_ENV === 'production' ? '.diploma.nomoredomains.xyz' : undefined,
          maxAge: week,
          httpOnly: false,
          sameSite: false,
          secure: false,
        })
        .end();
    })
    .catch((error) => {
      next(error);
    });
};
