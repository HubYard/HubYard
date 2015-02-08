
/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var session = require('express-session');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 4002);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session({ secret: 'swag1000emo', resave:false, saveUninitialized:false}));
app.use(methodOverride());

//app.use(favicon(__dirname + '/public/img/favicon.ico')); 





require('./data')(app);

app.use(require('stylus').middleware({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
