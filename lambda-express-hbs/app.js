var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const taskmasterInstructionsRouter = require("./routes/taskmaster-insructions");
const gameSettingsRouter = require("./routes/game-settings");
const roomCodeRouter = require("./routes/room-code");
const joinRouter = require("./routes/join");

var app = express();

const debugMidware = (req, res, next) => {
  console.log("app: reuquest received", req);
  return next();
};
// app.use("/", debugMidware);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/taskmaster-instructions", taskmasterInstructionsRouter);
app.use("/game-settings", gameSettingsRouter);
app.use("/room-code", roomCodeRouter);
app.use("/join", joinRouter);

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

module.exports = app;
