const express = require('express');
const morgan = require('morgan'); //3rd party middleware, used to log the HTTP request
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Global Middlewares
//Should often be before routing, since all operations are done on the requested object before being forwarded to the client
//Like a pipeline, that's why they all end up with the next() to move on to the next middleware before we reach the client.
//They all start with app.use, they will have access then to the req/res object
//They are executed according to their order in the code

//Security HTTP headers
app.use(helmet());

//Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  //100 request per hour
  message: 'too many requests from this IP, try again after one hour'
});
app.use('/api', limiter);

//Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//When posting json body, it converts it to JavaScript object (Body parser)
//the limit is a security option to limit data passed to body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection
//for example: adding this {"$gt":""} to email, always returns true
app.use(mongoSanitize());

//Data sanitization against XSS
//for example: adding HTML code with malicious JS code
app.use(xss());

//Prevent parameter pollution
//sort=duration&sort=price causes error, we implemented our app to deal with sort=duration,price
app.use(hpp());

//Serve static files from folders not routes
app.use(express.static(`${__dirname}/public`));

//Resources routes
app.use('/', viewRouter);
//Middleware functions, parameters are(where to use it (parent api) ,what to use)

//As we reached this point of the app, the request couldnt find its router aka ERROR
//all * makes us handle all http methods
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on the server`, 404)); //pasisng to next->express consider error->skip middlewares
});

app.use(globalErrorHandler);
module.exports = app;
