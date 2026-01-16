const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.flash("error","You must be logged in to create a new listing!");
        res.redirect("/user/login");
    }
    else next();
}
module.exports= isLoggedIn;