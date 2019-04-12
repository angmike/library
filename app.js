var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mailer = require('express-mailer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');
var config = require('./config/index');
var auth = require('./auth/secure');

var app = express();

mailer.extend(app, {
  from: 'no-reply@library.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'mikeanguandia@gmail.com',
    pass: 'angmike1210'
  }
});

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/library';

// var mongoDB = 'mongodb+srv://mike:kukuer1210@cluster0-rnxi2.mongodb.net/library?retryWrites=true';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('secret', config.secret);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(session({cookie: {
//   maxAge: 60000, httpOnly: true,
//   resave: true,
//   saveUninitialized: true,
//   secret: 'secret'
// }}));
app.use(express.static(path.join(__dirname, 'public')));
// set a cookie
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {
    // no: set a new cookie
    // var randomNumber=Math.random().toString();
    // randomNumber=randomNumber.substring(2,randomNumber.length);
    var name = 'Authorization';
    res.cookie('cookieName',name, { maxAge: 3600, httpOnly: true });
    console.log('cookie created successfully');
  }
  else
  {
    // yes, cookie was already present
    console.log('cookie exists', cookie);
  }
  next(); // <-- important!
});

// add authorization header to all outgoing requests from browser client
app.use(function(req, res, next){
    if(!req.headers.authorization){
        req.headers.authorization = req.cookies.Authorization;
      }
      next();
    });

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);
app.use(auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

require('dotenv').config();

module.exports = app;
