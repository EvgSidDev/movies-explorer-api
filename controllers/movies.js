const Movie = require('../models/movies');
const {
  ValidationError,
  CastError,
  OK,
  OK_CREATE,
} = require('../utils/httpConstants');
const ServerError = require('../errors/ServerError');
const DataError = require('../errors/DataError');
const NotFoundError = require('../errors/NotFound');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => res.status(OK).send(movies))
    .catch((err) => next(new ServerError(err.message)));
};

module.exports.addMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movies) => res.status(OK_CREATE).send(movies))
    .catch((err) => {
      if (err.name === ValidationError) {
        next(new DataError(err.message));
      } else {
        next(new ServerError('Неизвестная ошибка сервера'));
      }
    });
};

module.exports.deleteMovies = (req, res, next) => {
  const _id = req.params.moviesId;
  Movie.findById({ _id })
    .orFail(() => next(new NotFoundError('Фильм не найден')))
    .then((movie) => {
      if (movie.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('Нельзя удалать чужие фильмы');
      }
      Movie.deleteOne({ _id }).then((deleteResult) => {
        res.status(OK).send(deleteResult);
      });
    })
    .catch((err) => {
      if (err.statusCode) {
        next(err);
      } else if (err.name === CastError) {
        next(new NotFoundError('Передан невалидный id'));
      } else {
        next(new ServerError('Неизвестная ошибка сервера'));
      }
    });
};
