const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    comment : String,
    rating : {
        type : Number,
        default : 1,
        min : 1,
        max : 5
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    writer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }

})
const Review = new mongoose.model("Review",reviewSchema);
module.exports = Review;