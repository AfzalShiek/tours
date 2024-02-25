const Tour = require('./models/tourModels');
const Booking = require('./models/bookingModel');
const catchAsync = require('./../starter/utils/catchAsync');
const AppError = require('./../starter/utils/appError');
const factory = require('./../Controller/handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1)Get the Currently Booked Tour
  const tour = await Tour.findById(req.params.tourID);

  // console.log(req.get('host'));

  //2)Create the CheckoutSession
  //   const session = await stripe.checkout.sessions.create({
  //     payment_method_types: ['card'],
  //     success_url: `${req.protocol}://${req.get('host')}/`,
  //     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  //     customer_email: req.user.email,
  //     client_reference_id: req.params.tourID,
  //     line_items: [
  //       {
  //         name: `${tour.name} Tour`,
  //         description: tour.summary,
  //         images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  //         amount: tour.price * 100,
  //         currency: 'usd',
  //         quantity: 1,
  //       },
  //     ],
  //   });

  // const session = await stripe.checkout.sessions.create({
  //     payment_method_types: ["card"],
  //     success_url: `${req.protocol}://${req.get("host")}/`,
  //     cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
  //     customer_email: req.user.email,
  //     client_reference_id: req.params.tourID,
  //     line_items: [
  //       {
  //         price_data: {
  //           currency: "usd",
  //           product_data: {
  //             name: `${tour.name} Tour`,
  //             images: [`http://localhost:3000/img/tours/${tour.imageCover}`],
  //             description: tour.summary,
  //           },
  //           unit_amount: tour.price * 100,
  //         },
  //         quantity: 1,
  //       },
  //     ],
  //     mode: "payment",
  //   });

  const transformedItems = [
    {
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: tour.price * 100,
        product_data: {
          name: `${tour.name} Tour`,
          description: tour.summary, //description here
          images: [
            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
          ], //only accepts live images (images hosted on the internet),
        },
      },
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/`, //user will be redirected to this url when payment is successful. home page
    // cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`, //user will be redirected to this url when payment has an issue. tour page (previous page)
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID, //this field allows us to pass in some data about this session that we are currently creating.
    line_items: transformedItems,

    mode: 'payment',
  });

  // const session = await stripe.products.create({
  //     name: `${tour.name} Tour`,
  //     description: tour.summary,
  //     images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  //   }).then(product => {
  //     stripe.prices.create({
  //       unit_amount: tour.price * 100,
  //       currency: 'usd',
  //       recurring: {
  //         interval: 'month',
  //       },
  //       product: product.id,
  //     }).then(price => {
  //       console.log('Success! Here is your starter subscription product id: ' + product.id);
  //       console.log('Success! Here is your starter subscription price id: ' + price.id);
  //     });
  //   });
  //3)Create Session as Response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const {tour, user, price} = req.query;
  console.log(tour, user, price, 'bookingData');
  if (!tour && !user && !price) return next();
  await Booking.create({tour, user, price});
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1)Find all the bookings
  const booking = await Booking.find({user: req.user.id});
  //2)Find tours with the returned ID's
  const tourIDs = booking.map(el => el.tour);
  const tour = await Tour.find({_id: {$in: tourIDs}});
  

  res.status(200).json({
    status:'success',
    title:'My Tours',
    tour
  });
});

exports.redirect=async()=>{

  await stripe.redirectToCheckout({
    sessionId: session.data.session.id
  });
}



