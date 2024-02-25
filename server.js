const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" }); //This Above Two Lines should be defined before importing app

process.on("uncaughtException", (err) => {
  // console.log("UNCAUGHT EXCEPTION ! 💥Shutting Down...");
  // console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// mongoose.connect(process.env.DATABASE_LOCAL,{}) To Connect Locally
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB Connection Successful"));

// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "A Tour must have a Name"],
//     unique: true,
//   },
//   rating: {
//     type: Number,
//     default: 4.5,
//   },
//   price: {
//     type: Number,
//     required: [true, "A tour must have a Price"],
//   },
// });

//For Testing
// const Tour = mongoose.model("Tour", tourSchema);

// const testTour = new Tour({
//   name: "The Park Hamper",
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("Error :", err);
//   });

const app = require("./app");

// console.log(process.env);
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION ! 💥Shutting Down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

