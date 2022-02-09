const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const regExp = require('../utils/regexp');

const { getMovies, createMovie, deleteMovie } = require('../controllers/movie');

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required().min(3).max(30),
    director: Joi.string().required().min(3).max(30),
    duration: Joi.number().required(),
    year: Joi.string().required().length(4),
    description: Joi.string().required().min(10).max(100),
    image: Joi.string().pattern(regExp).required(),
    trailerLink: Joi.string().pattern(regExp).required(),
    nameRU: Joi.string().required().min(3).max(30),
    nameEN: Joi.string().required().min(3).max(30),
    thumbnail: Joi.string().pattern(regExp).required(),
    movieId: Joi.number().integer().required(),
  }),
}), createMovie);

router.delete('/movies/:_id', celebrate({
  params: Joi.object().keys({ _id: Joi.string().length(24).hex().required() }),
}), deleteMovie);

module.exports = router;
