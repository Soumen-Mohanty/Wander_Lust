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
const listingSchema = require("./models/listing_validation_joi.js");
const reviewSchema = require("./models/review_validation_joi.js");
const app = express();
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
const reviewValidate = (req,res,next) => {
  let validation_result = reviewSchema.validate(req.body);
  if(validation_result.error)
  {
    let errMsg = validation_result.error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  next();
}
app.get("/listings", async (req, res) => {
  data = await Listing.find({});
  res.render("listings/all_Listings.ejs", { data });
});

app.get("/listings/new_listing", async (req, res) => {
  res.render("listings/new_listing.ejs");
});

app.post(
  "/listings/new_listing",
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
    res.render("listings/all_Listings.ejs", { data });
  })
);

app.get("/listings/:id", async (req, res) => {
  data = await Listing.findById(req.params.id).populate("reviews");
  res.render("listings/detail.ejs", { data });
});
app.get("/listings/edit/:id", async (req, res) => {
  const data = await Listing.findById(req.params.id);
  res.render("listings/edit.ejs", { data });
});
app.put("/listings/edit/:id",
  listingValidate,
  wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/listings");
})
);

app.delete("/listings/delete/:id", async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
});
app.post("/listings/review/:id",
  reviewValidate,
  wrapAsync(async (req,res) => {
  const rev = new Review(req.body);
  await rev.save();
  const list = await Listing.findById(req.params.id);
  list.reviews.push(rev);
  await Listing.findByIdAndUpdate(req.params.id,list);
  res.redirect(`/listings/${req.params.id}`);
}))
app.delete("/listings/delete_review/:listing_id/:review_id",wrapAsync(async(req,res)=>{
  const {listing_id,review_id} = req.params;
  await Listing.findByIdAndUpdate(listing_id,{$pull :{reviews : review_id}});
  await Review.findByIdAndDelete(review_id);
  res.redirect(`/listings/${listing_id}`);
}))
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});
