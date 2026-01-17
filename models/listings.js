const mongoose = require("mongoose");
const Review = require(("./review_schema.js"));
const listingSchema = new mongoose.Schema({
    title : {type : String},
    description : {type : String},
    image : {
        type : String,
        set : (v)=>(v==="") ? "https://unsplash.com/photos/sunlight-streams-through-trees-onto-a-cascading-waterfall-eV180K41pFs" : v
    },
    price : {type : Number},
    location : {type : String},
    country : {type : String},
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    }
})
listingSchema.post("findOneAndDelete",async (doc)=>{
    if(doc)
    {
        if(doc.reviews.length>0)
    {
        await Review.deleteMany({_id : {$in : doc.reviews}});
    }
    }
})
const Listing = new mongoose.model("Listing",listingSchema);
module.exports = Listing;