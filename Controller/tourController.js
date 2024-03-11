// const fs = require("fs");
const Tour = require('./models/tourModels');
const catchAsync = require('./../starter/utils/catchAsync');
const AppError = require('./../starter/utils/appError');
const factory = require('./../Controller/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please Upload Only Images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3},
]);

//upload.single('image') req.file
//upload.array('images',5) req.files will be produced by fields and array

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  //1)Processing the Cover Images
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // console.log(req.body.imageCover, 'imageCoveer');

  //2)Processing Images
  
  req.body.images = await Promise.all(
    req.files.images.map((image, i) => {
      const imageName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${imageName}`);
      return imageName;
    })
  );
  // console.log(req.body.images, 'images');

  next();
});
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`)
//   );

//Using Param MiddleWare
// exports.checkId = ( req,res,next,val) => {
//     console.log(`Tour Id is : ${val}` );
//     if (req.params.id * 1 > tours.length - 1) {
//         res.status(404).json({
//           status: "fail",
//           message: "Invalid Id",
//         });
//       }
//       next();
// }

// exports.checkBody =  (req,res,next)=>{
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status:'fail',
//             message:'Missing name or Pride'
//         })
//     }
//     next();
// }

exports.aliasTopTours = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});

exports.getAllTours = factory.getAll(Tour);
/* #swagger.tags = ['Open']
                           #swagger.description = 'This routes is used to get all the Tours'  */
       

        /*	#swagger.parameters['data'] = {
                                in: 'body',
                                description: 'User  Details',
                                required: true,
                                schema: { $ref: "#/definitions/TourDetails" }
        }*/


exports.getTour = factory.getOne(Tour, {path: 'reviews'});

// catchAsync(async (req, res, next) => {
//     // const id = req.params.id * 1;
//     //Converts String to number
//     //   if (id > tours.length-1) {
//     // if (!tour) {
//     //   res.status(404).json({
//     //     status: "fail",
//     //     message: "Invalid Id",
//     //   });
//     // }
//     // console.log(tour.length);

//     // const tour = tours.find((el) => el.id === id);

//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     if (!tour) {
//         return next(new AppError('No Tour Found with that ID', 404));
//     }
//     //Tour.findOne({_id:req.params.id})
//     res.status(200).json({
//         status: 'success',
//         results: tour.length,
//         data: {
//             tours: tour,
//         },
//     });
// });

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//     // if (req.params.id * 1 > tours.length - 1) {
//     //   res.status(404).json({
//     //     status: "fail",
//     //     message: "Invalid Id",
//     //   });
//     // }
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true, //Updated document will be returned
//         runValidators: true,
//     });

//     if (!tour) {
//         return next(new AppError('No Tour Found with that ID', 404));
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     // if (req.params.id * 1 > tours.length - 1) {
//     //   res.status(404).json({
//     //     status: "fail",
//     //     message: "Invalid Id",
//     //   });
//     // }
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError('No Tour Found with that ID', 404));
//     }
//     res.status(204).json({
//         status: 'success',
//         data: null,
//     });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {ratingsAverage: {$gte: 4.5}},
    },
    {
      $group: {
        _id: {$toUpper: '$difficulty'},
        numTours: {$sum: 1},
        numRatings: {$sum: '$ratingsQuantity'},
        avgRating: {$avg: '$ratingsAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'},
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: { _id: { $ne: "EASY" } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {$month: '$startDates'},
        numTourStarts: {$sum: 1},
        tours: {$push: '$name'},
      },
    },
    {
      $addFields: {month: '$_id'},
    },
    {
      $project: {_id: 0}, //to Remove _id
    },
    {
      $sort: {numTourStarts: -1},
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-/:distance/center/:latlng/unit/:unit
// /tours-distance/233/center/-34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const {distance, latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //Converting it to Radian divide it by radius of the Earth

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide Latitude and Longitude in the format lat, lat',
        400
      )
    );
  }
  console.log(distance, latlng, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}},
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const {latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide Latitude and Longitude in the format lat, lat',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], //Multiplying by 1 to convert it to Numbers
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        //Adds Only These Fields
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
