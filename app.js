var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

//var uuid = require('node-uuid');

var routes = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');
var messages = require('./lib/messages');
var login = require('./routes/login');
var user = require('./lib/middleware/user');
var entries = require('./routes/entries');
var validate = require('./lib/middleware/validate');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var client = redis.createClient(6379, '127.0.0.1');
client.on('error', function (err) {
    console.log('Error' + err);
});

app.use(session({
    store: new RedisStore({client:client}),
    saveUninitialized: false,
    secret: 'keyboard cat',
    resave: true,
   /* genid: function(req) {
        return uuid.v4(); // use UUIDs for session IDs
    },*/
    cookie: { path: '/', httpOnly: true, maxAge: 3600000 * 0.5 }
    //如果网站不是https协议，不要在cookie中加 secure: true !!!
}));

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('oh no')); // handle error
    }
    next(); // otherwise continue
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(user);
app.use(messages);

app.use('/', routes);
app.use('/users', users);

// register module
app.get('/register', register.form);
app.post('/register', register.submit);

//login module
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

// post module
app.get('/post', entries.form);
app.post('/post', validate.required('entry[title]'), validate.lengthAbove('entry[title]', 4), entries.submit);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
