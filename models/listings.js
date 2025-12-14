const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
    title : {type : String},
    description : {type : String},
    image : {
        type : String,
        set : (v)=>(v==="") ? "https://unsplash.com/photos/sunlight-streams-through-trees-onto-a-cascading-waterfall-eV180K41pFs" : v
    },
    price : {type : Number},
    location : {type : String},
    country : {type : String}
})
const Listing = new mongoose.model("Listing",listingSchema);
module.exports = Listing;