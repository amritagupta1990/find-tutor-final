var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
const bodyParser = require("body-parser");
// var usersRouter = require('./routes/users');

var app = express();

require('./config/config.js');

app.use(express.static(__dirname + '/views/react-frontend'));
app.use(express.static('public'));
app.use(cors());

// global.jwtSecret = "react-poc-secret-key";

/*** CORS Configuration ***/
// var whitelist = ['http://localhost:3000'];
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions));
/*** CORS Configuration ***/

app.use(bodyParser.json({limit: '5000mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));ß
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// app.use('/', indexRouter);
// app.use('/users', usersRouter);




// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
app.use('/api', indexRouter);
// app.get('/*', (req, res) => {
//   const indexFile = path.resolve(__dirname + "/views/react-frontend/index.html");
//   res.sendfile(indexFile);
// })


module.exports = app;
