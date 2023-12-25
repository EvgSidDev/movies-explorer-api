const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {
  ValidationError,
  CastError,
  OK,
  OK_CREATE,
} = require('../utils/httpConstants');
require('dotenv').config();
const ServerError = require('../errors/ServerError');
const DataError = require('../errors/DataError');
const NotFoundError = require('../errors/NotFound');
const NotUniqueError = require('../errors/NotUniqueError');

const {
  JWT_SECRET = 'eb28135ebcfc17578f961d5c2db621c51b',
} = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password, next)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.status(OK).send({
        jwt: token,
      });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        email,
        password: hash,
      })
        .then((user) => {
          res.status(OK_CREATE).send({
            name: user.name,
            email: user.email,
          });
        })
        .catch((err) => {
          if (err.name === ValidationError) {
            next(new DataError(err.message));
          } else if (err.code === 11000) {
            next(new NotUniqueError('Указанная почта уже используется'));
          } else {
            next(new ServerError('Неизвестная ошибка сервера'));
          }
        });
    })
    .catch((err) => next(new ServerError(err.message)));
};

module.exports.getUser = (req, res, next) => {
  let idUser = req.user;
  if (req.params.userId) {
    idUser = req.params.userId;
  }
  User.findById(idUser)
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
    .then((user) => {
      res.status(OK).send(user);
    })
    .catch((err) => {
      if (err.statusCode) {
        next(err);
        return;
      }
      if (err.name === CastError) {
        next(new DataError('Передан невалидный id'));
      } else {
        next(new ServerError('Неизвестная ошибка сервера'));
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findOneAndUpdate(
    { _id: req.user._id },
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
    .then((resultUpdate) => {
      res.status(OK).send(resultUpdate);
    })
    .catch((err) => {
      if (err.name === ValidationError) {
        next(new DataError({ message: err.message }));
      } else {
        next(new ServerError('Неизвестная ошибка сервера'));
      }
    });
};
