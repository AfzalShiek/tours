const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const compression = require('compression');

const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./starter/utils/appError');
const globalErrorHandler = require('./Controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const cors = require('cors');

const app = express();
// Enable trust proxy
app.set('trust proxy', true);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/utils/views'));
// console.log(process.env.NODE_ENV);

// 1)GLOBAL MIDDLEWARES
//Implement CORS
app.use(cors());
//Access-Control-Allow-Origin *
//To allow access for specific Routes
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );
app.options('*',cors());

//Serving static Files
// app.use(express.static(`${__dirname}/starter/public`));
app.use(express.static(path.join(__dirname, '/public')));

//SET SECURITY HTTP HEADERS
app.use(helmet());

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'http://127.0.0.1:3000/api/v1/users/login',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

//set security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

//BODY PARSER,READING DATA FROM THE BODY INTO REQ.BODY
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

app.use(compression());
//Testing MiddleWare
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// app.get("/", (req, res) => {
//   res
//     .status(200)
//     .json({ message: "Hello From the Server Side", app: "Natours" });
// });

// app.post("/", (req, res) => {
//   res.send("You can post to this EndPoint...");
// });

// 2) ROUTE HANDLERS

// 3) ROUTES

// const tourRouter = express.Router();
// const userRouter = express.Router();

// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);

// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

//Parent Routes
// app.use('/', viewRouter);
const swaggerFile = JSON.parse(
  fs.readFileSync('./resources/views/swagger-api-view.json', 'utf-8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.get('/', (req, res) => res.redirect('/api-docs'));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
