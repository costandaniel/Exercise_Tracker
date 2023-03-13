const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, () => {
  console.log("Db succesfuly");
});
mongoose.set("strictQuery", false);
//db stuff
const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
});
const User = mongoose.model("User", userSchema);

const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: {
    type: Date,
    default: new Date(),
  },
  userId: mongoose.Types.ObjectId,
});
const Exercise = mongoose.model("Exercise", exerciseSchema);
//db stuff
const { urlencoded } = require("express");
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
//Get request to /api/users

app.get("/api/users", async (req, res, next) => {
  try {
    const users = await User.find({}, "-__v");
    res.send(users);
  } catch (error) {
    return next(error);
  }
});

//Post to /api/users
app.post("/api/users", async (req, res, next) => {
  try {
    const username = req.body.username;
    const foundUser = await User.findOne({ username });

    if (foundUser) {
      res.json({
        username: foundUser.username,
        _id: foundUser._id,
      });
    }

    const user = await User.create({
      username,
    });
    res.json({
      username,
      _id: user._id,
    });
  } catch (error) {
    return next(error);
  }
});

// Post to /api/users/:_id/exercices
app.post("/api/users/:_id/exercises", async (req, res, next) => {
  try {
    const { description, duration, date, userId } = await Exercise.create({
      ...req.body,
      userId: mongoose.Types.ObjectId(req.params._id),
    });

    const { username } = await User.findById(userId);
    res.send({
      username,
      _id: userId,
      description,
      duration,
      date: date.toDateString(),
    });
  } catch (error) {
    next(error);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
