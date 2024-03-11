// import swaggerAutogen from 'swaggerAutogen';
const swaggerAutogen = require('swagger-autogen')();
// import config from 'config';

const doc = {
    info: {
        app_version:  '1.0.0',
        title: 'Natours API`s', // by default: "REST API"
        description: 'Documentation', // by default: ""
    },
    host: "localhost:3000", // by default: "localhost:3000"
    basePath: '/', // by default: "/"
    schemes: ['http', 'https'],
    consumes: ['application/json', 'application/x-www-form-urlencoded'],
    produces: ['application/json'],
    tags: [
        // by default: empty Array
        {
            name: 'Open', // Tag name
            description: 'Open Endpoints', // Tag description
        },
        
    ],

    securityDefinitions: {
        AccessToken: {
            type: 'apiKey',
            in: 'header',
            name: 'x-access-token',
            description: 'Please provide the valid access token, if you dont have please login and get the token as response!',
        },
        // Bearer: {
        //     type: 'apiKey',
        //     name: 'Authorization',
        //     in: 'header',
        //     description: 'Enter your bearer token in the format **Bearer &lt;token>**',
        // },
    }, // by default: empty object
    definitions: {
      

      

        TourDetails: {
           

            
                startLocation: {
                  description: "Miami, USA",
                  type: "Point",
                  coordinates: [-80.185942, 25.774772],
                  address: "301 Biscayne Blvd, Miami, FL 33132, USA"
                },
                ratingsAverage: 4.8,
                ratingsQuantity: 6,
                images: ["tour-2-1.jpg", "tour-2-2.jpg", "tour-2-3.jpg"],
                startDates: [
                  "2021-06-19T09:00:00.000Z",
                  "2021-07-20T09:00:00.000Z",
                  "2021-08-18T09:00:00.000Z"
                ],
                _id: "5c88fa8cf4afda39709c2955",
                name: "The Sea Explorer",
                duration: 7,
                maxGroupSize: 15,
                difficulty: "medium",
                guides: ["5c8a22c62f8fb814b56fa18b", "5c8a1f4e2f8fb814b56fa185"],
                price: 497,
                summary: "Exploring the jaw-dropping US east coast by foot and by boat",
                description: "Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\nIrure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                imageCover: "tour-2-cover.jpg",
                locations: [
                  {
                    _id: "5c88fa8cf4afda39709c2959",
                    description: "Lummus Park Beach",
                    type: "Point",
                    coordinates: [-80.128473, 25.781842],
                    day: 1
                  },
                  {
                    _id: "5c88fa8cf4afda39709c2958",
                    description: "Islamorada",
                    type: "Point",
                    coordinates: [-80.647885, 24.909047],
                    day: 2
                  },
                  {
                    _id: "5c88fa8cf4afda39709c2957",
                    description: "Sombrero Beach",
                    type: "Point",
                    coordinates: [-81.0784, 24.707496],
                    day: 3
                  },
                  {
                    _id: "5c88fa8cf4afda39709c2956",
                    description: "West Key",
                    type: "Point",
                    coordinates: [-81.768719, 24.552242],
                    day: 5
                  }
                ]
              

        },
    },
};

const outputFile = './swagger-api-view.json';
const endpointsFiles = ['./../../app.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);
