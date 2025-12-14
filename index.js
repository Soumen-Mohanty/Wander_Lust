const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const path = require("path");
const Listing =require("./models/listings.js");
const engine = require("ejs-mate");
const app = express();
app.engine('ejs', engine);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.listen(3000,()=>{
    console.log("App is ready to go");
})
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
main().catch((err)=>{console.log(err)});
 app.get("/listings", async(req,res)=>{
    data = await Listing.find({});
    res.render("listings/all_Listings.ejs",{data});
 })

 app.get("/listings/new_listing", async (req,res)=>{
  res.render("listings/new_listing.ejs");
 })

 app.post("/listings/new_listing", async (req,res)=>
{
   let new_data = new Listing(
    {
      title : req.body.title,
      description : req.body.description,
      image : req.body.img,
      price : req.body.price,
      location : req.body.location,
      country : req.body.country
    }
   )
   await new_data.save();
   const data = await Listing.find();
   res.render("listings/all_Listings.ejs",{data});
})
 
 app.get("/listings/:id", async(req,res)=>{
   data = await Listing.findById(req.params.id);
   res.render("listings/detail.ejs",{data});
 })
 app.get("/listings/edit/:id", async(req,res)=>{
  const data = await Listing.findById(req.params.id);
  res.render("listings/edit.ejs",{data});
 })
 app.put("/listings/edit/:id",async (req,res)=>{
  await Listing.findByIdAndUpdate(req.params.id,req.body);
  res.redirect("/listings")
 })

 app.delete("/listings/delete/:id",async (req,res)=>{
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
 })
 
 