const router = require('express').Router();
// eslint-disable-next-line import/no-extraneous-dependencies
const { celebrate, Joi } = require('celebrate');
const {
  getUser,
  updateUser,
} = require('../controllers/users');

router.get('/me', getUser);
router.patch(
  '/me',
  celebrate({
    body: Joi.object()
      .keys({
        name: Joi.string().required().min(2).max(30),
        email: Joi.string().required().email(),
      })
      .unknown(true),
  }),
  updateUser,
);

module.exports = router;
