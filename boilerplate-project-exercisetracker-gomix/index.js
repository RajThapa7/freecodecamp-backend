const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { urlencoded } = require("express");
require("dotenv").config();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const UserSchema = new mongoose.Schema({ username: String });

const ExerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
let User = mongoose.model("User", UserSchema);
let Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(cors());
app.use(express.static("public"));
app.use(urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
  });
  newUser.save((err, data) => {
    if (err) {
      res.send("Error saving the user");
    } else {
      res.json({
        username: data.username,
        _id: data._id,
      });
    }
  });
});

app.get("/api/users", (req, res) => {
  User.find()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.json(error);
    });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  let { description } = req.body;
  let { duration } = req.body;
  let { date } = req.body;
  User.findById(_id, (err, userData) => {
    if (err) {
      res.status(404).send("User not found");
    } else {
      const newExercise = new Exercise({
        userId: _id,
        description,
        duration,
        date: new Date(date),
      });
      newExercise.save((err, data) => {
        if (err) {
          res.send("There was an error saving the data");
        } else {
          const { description, duration, date, _id } = data;
          res.json({
            username: userData.username,
            description,
            duration,
            date: date.toDateString(),
            _id: userData._id,
          });
        }
      });
    }
  });
});

app.get("/api/users/:id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const { id } = req.params;
  User.findById(id, (err, userData) => {
    if (err) {
      res.status(404).send("User not found");
    } else {
      let dateObj = {};
      if (from) {
        dateObj["$gte"] = new Date(from);
      }
      if (to) {
        dateObj["$lte"] = new Date(to);
      }
      let filter = {
        userId: id,
      };
      if (from || to) {
        filter.date = dateObj;
      }

      let nonNullLimit = limit ?? 500;
      Exercise.find(filter)
        .limit(nonNullLimit)
        .exec((err, data) => {
          if (err) {
            res.json([]);
          } else {
            const count = data.length;
            const rawLog = data;
            const { username, _id } = userData;
            const log = rawLog.map((l) => ({
              description: String(l.description),
              duration: Number(l.duration),
              date: l.date.toDateString(),
            }));

            res.json({
              //  _id, username, count,
               userData,
               count,
               log });
          }
        });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
