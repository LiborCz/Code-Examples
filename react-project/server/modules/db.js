//jshint esversion:6

const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const findOrCreate = require("mongoose-findorcreate");
const passportLocalMongoose = require("passport-local-mongoose");

/// DB init

// const db = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PWD}@cluster0-depo4.mongodb.net/LostAndFound`;
const db = `mongodb+srv://admin-libor:Telephone7Mb@cluster0.depo4.mongodb.net/LostAndFound?retryWrites=true&w=majority`;

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log("Mongo DB Connected"))
  .catch(err => console.log("Mongo DB connection error: " + err));


/// USER

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  source: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: false },
  provider: String,
  providerId: String,
  pictureURL: String
});

userSchema.plugin(timestamps);
userSchema.plugin(findOrCreate);
userSchema.plugin(passportLocalMongoose);

module.exports.User = new mongoose.model("User", userSchema);


/// SESSION

const userSessionSchema = new mongoose.Schema({
  userId: String,
  token: String,
  iat: { type: Date, default: Date.now() },
  exp: { type: Date, default: Date.now() },
  isActive: { type: Boolean, default: true }
});

userSessionSchema.plugin(timestamps);
userSessionSchema.plugin(findOrCreate);

module.exports.UserSession = new mongoose.model("UserSession", userSessionSchema);


///  ITEM

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String },
  location: { type: {type:String}, coords: [Number] },  //"Point", ["Lng", "Lat"]
  c_user: String
});

itemSchema.plugin(timestamps);

module.exports.Item = new mongoose.model("Item", itemSchema);
