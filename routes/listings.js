const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listings.js");
const Review = require("../models/review_schema.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const listingSchema = require("../models/listing_validation_joi.js");
const ExpressError = require("../utilities/ExpressError.js");
const isLoggedIn = require("../middlewares.js");
const listingValidate = (req,res,next) => 
{
  let validation_result = listingSchema.validate(req.body);
  if (validation_result.error)
  {
    let errMsg = validation_result.error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  next();
}
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
    });
    await new_data.save();
    const data = await Listing.find();
    req.flash("success","Successfully Created A New Listing!");
    res.redirect("/listings");
  })
);

router.get("/:id", async (req, res) => {
  data = await Listing.findById(req.params.id).populate("reviews");
  if(!data)
  {
    req.flash("dne","Listing Not Found!");
    res.redirect("/listings");
  }
  else res.render("listings/detail.ejs", { data });
});
router.get("/edit/:id",isLoggedIn, async (req, res) => {
  const data = await Listing.findById(req.params.id);
  if(!data)
  {
    req.flash("dne","Listing Not Found!");
    res.redirect("/listings");
    return;
  }
  res.render("listings/edit.ejs", { data });
});
router.put("/edit/:id",isLoggedIn,
  listingValidate,
  wrapAsync(async (req, res) => {
   await Listing.findByIdAndUpdate(req.params.id, req.body);
  req.flash("success","Successfully Updated A Listing!");
  res.redirect("/listings");
})
);

router.delete("/delete/:id",isLoggedIn, async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success","Successfully Deleted A Listing!");
  res.redirect("/listings");
});
module.exports = router;