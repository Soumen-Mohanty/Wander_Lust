const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listings.js");
const Review = require("../models/review_schema.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const listingSchema = require("../models/listing_validation_joi.js");
const ExpressError = require("../utilities/ExpressError.js");
const {isLoggedIn,isOwner,listingValidate} = require("../middlewares.js");
router.get("/", async (req, res) => {
  data = await Listing.find({});
  req.session.hello = "world"
  res.render("listings/all_Listings.ejs", { data });
});

router.get("/new_listing", isLoggedIn, async (req, res) => {
  res.render("listings/new_listing.ejs");
});

router.post(
  "/new_listing",
  isLoggedIn,
  listingValidate,
  wrapAsync(async (req, res) => {
    // if(!req.body.title) throw new ExpressError(400,"Title Not Found");
    // if(!req.body.description) throw new ExpressError(400,"Enter Valid Description");
    // if(!req.body.img) throw new ExpressError(400,"Enter A Valid URL");
    // if(!req.body.price) throw new ExpressError(400,"Enter A Valid Price");
    // if(!req.body.location) throw new ExpressError(400,"Enter Valid Location");
    // if(!req.body.country) throw new ExpressError(400,"Enter a Valid Country");
    
    let new_data = new Listing({
      title: req.body.title,
      description: req.body.description,
      image: req.body.img,
      price: req.body.price,
      location: req.body.location,
      country: req.body.country,
      owner : req.user._id
    });
    await new_data.save();
    const data = await Listing.find();
    req.flash("success","Successfully Created A New Listing!");
    res.redirect("/listings");
  })
);

router.get("/:id", async (req, res) => {
  data = await Listing.findById(req.params.id).populate({path : "reviews", populate : {path : "writer"}}).populate("owner");
  if(!data)
  {
    req.flash("dne","Listing Not Found!");
    res.redirect("/listings");
  }
  else res.render("listings/detail.ejs", { data });
});
router.get("/edit/:id",isLoggedIn,isOwner, async (req, res) => {
  const data = await Listing.findById(req.params.id);
  if(!data)
  {
    req.flash("dne","Listing Not Found!");
    res.redirect("/listings");
    return;
  }
  res.render("listings/edit.ejs", { data });
});
router.put("/edit/:id",isLoggedIn,isOwner,
  listingValidate,
  wrapAsync(async (req, res) => {
  const temp_data = await Listing.findById(req.params.id).populate("owner");
  if(temp_data.owner.username !== req.user.username);
  {
    req.flash("error","You are not authorized to edit this listing!");
    res.redirect("/listings");
    return;
  }
  await Listing.findByIdAndUpdate(req.params.id, req.body);
  req.flash("success","Successfully Updated A Listing!");
  res.redirect("/listings");
})
);

router.delete("/delete/:id",isLoggedIn,isOwner, async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success","Successfully Deleted A Listing!");
  res.redirect("/listings");
});
module.exports = router;