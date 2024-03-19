const basicAuth = require('express-basic-auth');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'}); 
// const {logger} = require("./");

// const swaggerAuthLogger = (req, res, next) => {
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     // logger.info(------${new Date}------${req.auth.user}------${ip}------);
//     next();
// };

const auth = basicAuth({
  users: JSON.parse(process.env.SWAGGER_AUTH_IDS),
  challenge: true,
});

module.exports = {auth};
