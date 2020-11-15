const express           = require('express');
const path              = require('path');
const engine            = require('ejs-mate');
const flash             = require('express-flash');
const session           = require('express-session');
const passport          = require('passport');
const multer            = require('multer');
const morgan            = require('morgan');
const fs                = require('fs-extra');
const bodyParser        = require("body-parser");
const methodOverride    = require('method-override');
const uuid              = require('uuid/v4');
const { format }        = require('timeago.js');

//routes
const adminRoutes       = require('./routes/admin');
const indexRoutes       = require('./routes/index');
const userRoutes        = require('./routes/user');
const tallerRoutes      = require('./routes/taller');

// initializationss
const app = express();
require('./database');
require('./passport/local-auth');
require('./passport/seedAdmin');
require('./passport/seedUser');

// settings
app.set('port', 80 || 8000);
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, './public')));

// middlewares
app.use(morgan('dev'));
app.use(session({
  secret: 'mysecretsession',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 365 dias { maxAge: 31536000000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride('_method'));

app.use(express.urlencoded({extended: false}));


//Variables Globales 

app.use((req, res, next) => {
  app.locals.signinMessage = req.flash('signinMessage');
  app.locals.signupMessage = req.flash('signupMessage');
  app.locals.user = req.user;
  app.locals.tallerista = req.tallerista;
  app.locals.taller = req.taller;
  app.locals.modulo = req.modulo;
  app.locals.admin  = req.admin;
  app.locals.format = format;
  //console.log(app.locals)
  next();
});

// routes
app.use(indexRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(tallerRoutes);


// Starting the server
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});
