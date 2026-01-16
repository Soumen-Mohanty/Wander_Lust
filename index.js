const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const path = require("path");
const Listing = require("./models/listings.js");
const Review = require("./models/review_schema.js");
const engine = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError.js");
const wrapAsync = require("./utilities/wrapAsync.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const sessionOptions = 
{
  secret : "secretKey",
  resave : false,
  saveUninitialized : true,
  cookie : 
  {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
}
// const listingSchema = require("./models/listing_validation_joi.js");
// const reviewSchema = require("./models/review_validation_joi.js");
const app = express();
app.use(session(sessionOptions));
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.listen(3000, () => {
  console.log("App is ready to go");
});
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main().catch((err) => {
  throw new ExpressError(500,"Database Connection Failed");
});
// const listingValidate = (req,res,next) => 
// {
//   let validation_result = listingSchema.validate(req.body);
//   if (validation_result.error)
//   {
//     let errMsg = validation_result.error.details.map((el)=>el.message).join(",");
//     throw new ExpressError(400,errMsg);
//   }
//   next();
// }
// const reviewValidate = (req,res,next) => {
//   let validation_result = reviewSchema.validate(req.body);
//   if(validation_result.error)
//   {
//     let errMsg = validation_result.error.details.map((el)=>el.message).join(",");
//     throw new ExpressError(400,errMsg);
//   }
//   next();
// }
app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.dne = req.flash("dne");
  next();
})
app.use("/listings",require("./routes/listings.js"));
app.use("/listings/review",require("./routes/review.js"));
app.use("/user",require("./routes/user.js"));
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});