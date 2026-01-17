const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnPath = req.originalUrl;
    req.flash("error", "You must be logged in to make changes!");
    res.redirect("/user/login");
  } else next();
};

const saveReturnPath = (req, res, next) => {
  if (req.session.returnPath) {
    res.locals.returnPath = req.session.returnPath;
  }
  next();
};

const isOwner = async (req, res, next) => {
  const Listing = require("./models/listings.js");
  const data = await Listing.findById(req.params.id).populate("owner");
  if (data.owner.username !== req.user.username) {
    req.flash("error", "You are not authorized to customize this listing!");
    res.redirect("/listings");
    return;
  }
  next();
};

const isWriter = async (req, res, next) => {
  const ExpressError = require("./utilities/ExpressError.js");
  const Review = require("./models/review_schema.js");
  const data = await Review.findById(req.params.review_id).populate("writer");
  if (data.writer.username !== req.user.username) {
    req.flash("error", "You are not authorized to customize this review!");
    res.redirect("/listings");
    return;
  }
  next();
};

const listingValidate = (req, res, next) => {
  const ExpressError = require("./utilities/ExpressError.js");
  const listingSchema = require("./models/listing_validation_joi.js");
  let validation_result = listingSchema.validate(req.body);
  if (validation_result.error) {
    let errMsg = validation_result.error.details
      .map((el) => el.message)
      .join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};
const reviewValidate = (req, res, next) => {
  const ExpressError = require("./utilities/ExpressError.js");
  const reviewSchema = require("./models/review_validation_joi.js");
  let validation_result = reviewSchema.validate(req.body);
  if (validation_result.error) {
    let errMsg = validation_result.error.details
      .map((el) => el.message)
      .join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

module.exports = {
  isLoggedIn,
  saveReturnPath,
  isOwner,
  listingValidate,
  reviewValidate,
  isWriter,
};
