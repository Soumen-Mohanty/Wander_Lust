const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listings.js");
const Review = require("../models/review_schema.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const ExpressError = require("../utilities/ExpressError.js");
const reviewSchema = require("../models/review_validation_joi.js");
const {reviewValidate, isLoggedIn,isWriter} = require("../middlewares.js");
router.post("/:id",
  isLoggedIn,
  reviewValidate,
  wrapAsync(async (req,res) => {
  const rev = new Review(req.body);
  rev.writer = req.user._id;
  await rev.save();
  const list = await Listing.findById(req.params.id);
  list.reviews.push(rev);
  await Listing.findByIdAndUpdate(req.params.id,list);
  req.flash("success","Successfully Created A New Review!");
  res.redirect(`/listings/${req.params.id}`);
}))
router.delete("/delete/:listing_id/:review_id",isLoggedIn,isWriter,wrapAsync(async(req,res)=>{
  const {listing_id,review_id} = req.params;
  await Listing.findByIdAndUpdate(listing_id,{$pull :{reviews : review_id}});
  await Review.findByIdAndDelete(review_id);
  req.flash("success","Successfully Deleted A Review!");
  res.redirect(`/listings/${listing_id}`);
}))
module.exports = router;
