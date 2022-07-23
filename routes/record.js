const express = require("express");
const { default: mongoose } = require("mongoose");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

const timeslotSchema = new mongoose.Schema({
  date: {
    type: Date,
  },
});

const userSchema = new mongoose.Schema({
  firebaseid: { type: String },
  timeslots: {
    type: [Date],
    default: [],
  },
});

const Timeslot = mongoose.model("Timeslot", timeslotSchema);
const User = mongoose.model("User", userSchema);

// Gets the timeslots booked for the chosen date
recordRoutes.route("/booking/get").get(function (req, res) {
  const filterBottom = new Date(req.query.date);
  const filterTop = new Date(filterBottom.getTime() + 24 * 60 * 60 * 1000); //next day exact same time

  const slot = [];

  //Finds all timeslots booked for the chosen date and pushes it into the array "slot"
  Timeslot.find(
    { date: { $gte: filterBottom, $lte: filterTop } },
    function (err, bookedSlots) {
      if (err) {
        console.log(err);
      } else {
        bookedSlots.forEach((element) => slot.push(element.date));
        res.send(slot);
      }
    }
  );
});

//Gets all bookings made by the user
recordRoutes.route("/records/get").get(function (req, res) {
  User.find(
    {
      firebaseid: req.query.firebaseid,
    },
    function (err, result) {
      res.send(result);
    }
  );
});

// // This section will help you get a single record by id
// recordRoutes.route("/record/:id").get(function (req, res) {
// });

// Creates a new timeslot object to indicate it is booked. Also appends the timeslot into the user's timeslot array.
recordRoutes.route("/booking/add").post(function (req, response) {
  const timeslot = new Timeslot({ date: req.body.date });

  User.findOneAndUpdate(
    { firebaseid: req.body.firebaseid },
    {
      $push: {
        timeslots: [req.body.date],
      },
    },
    (err) => {
      console.log(err);
    }
  );

  timeslot.save();
});

// Creates a new user object for new users.
recordRoutes.route("/users/login").post(async function (req, response) {
  const id = req.body.firebaseid;
  const user = await User.findOne({ firebaseid: id });
  if (user) {
    return;
  } else {
    const newUser = new User({ firebaseid: id, timeslots: [] });
    newUser.save();
  }
});

// This section will help you update a record by id.
// recordRoutes.route("/update/:id").put(function (req, response) {
//   let db_connect = dbo.getDb();
//   let myquery = { _id: ObjectId(req.params.id) };
//   let newvalues = {
//     $set: {
//       name: req.body.name,
//       position: req.body.position,
//       level: req.body.level,
//     },
//   };
// });

// // This section will help you delete a record
// recordRoutes.route("/:id").delete((req, response) => {
//   let db_connect = dbo.getDb();
//   let myquery = { _id: ObjectId(req.params.id) };
//   db_connect.collection("records").deleteOne(myquery, function (err, obj) {
//     if (err) throw err;
//     console.log("1 document deleted");
//     response.json(obj);
//   });
// });

module.exports = recordRoutes;
