const router = require('express').Router();
// eslint-disable-next-line import/no-extraneous-dependencies
const { celebrate, Joi } = require('celebrate');
const { getMovies, addMovies, deleteMovies } = require('../controllers/movies');

router.get('/', getMovies);
router.post(
  '/',
  celebrate({
    body: Joi.object()
      .keys({
        country: Joi.string().required(),
        director: Joi.string().required(),
        duration: Joi.number().required(),
        year: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string()
          .required()
          .pattern(
            /https?:\/\/[a-z1-9\-\.\/\_\~\:\\\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]*/,
          ),
        trailerLink: Joi.string()
          .required()
          .pattern(
            /https?:\/\/[a-z1-9\-\.\/\_\~\:\\\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]*/,
          ),
        nameRU: Joi.string().required(),
        nameEN: Joi.string().required(),
        thumbnail: Joi.string()
          .required()
          .pattern(
            /https?:\/\/[a-z1-9\-\.\/\_\~\:\\\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]*/,
          ),
        movieId: Joi.number().integer().required(),
      })
      .unknown(true),
  }),
  addMovies,
);
router.delete(
  '/:moviesId',
  celebrate({
    params: Joi.object().keys({
      moviesId: Joi.string().required().length(24).hex(),
    }),
  }),
  deleteMovies,
);

module.exports = router;
