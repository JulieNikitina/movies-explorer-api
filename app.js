require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV } = process.env;

const app = express();

app.use(cors({
  origin: ['https://diploma.nomoredomains.xyz', 'http://diploma.nomoredomains.xyz'],
  allowedHeaders: ['Access-Control-Allow-Credentials', 'Access-Control-Allow-Origin', 'Content-Type'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
}, (err) => {
  if (err) {
    console.error('Unable to connect to mongodb', err);
  }
});

app.use(requestLogger);
app.use(require('./routes/authorization'));

app.use(auth);
app.use(require('./routes/user'));
app.use(require('./routes/movie'));

app.post('/signout', (req, res) => {
  res.status(200).clearCookie('jwt', {
    domain: NODE_ENV === 'production' ? '.diploma.nomoredomains.xyz' : undefined,
    httpOnly: false,
    sameSite: false,
    secure: false,
  }).send({ message: 'Выход' });
});

app.use((req, res, next) => {
  next(new NotFoundError('Пока запрашиваемой вами страницы нет, но не отчаивайтесь, возмоно она появится'));
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, _) => {
  // Прописываем дефолты на случай если внезапно прилетело что-то неожиданное
  res.status(err.statusCode || 500);
  res.send({ message: err.message || 'Неизвестная ошибка' });
});

app.listen(3000, () => {
  console.info('App listening on port 3000');
});
