const express = require("express");
const passport = require("passport");
const wrapAsync = require("../utilities/wrapAsync.js");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const { saveReturnPath } = require("../middlewares.js");
router.get("/sign-up", (req, res) => {
  res.render("users/sign_up.ejs");
});
router.post(
  "/sign-up",
  wrapAsync(async (req, res) => {
    const { email, username, password } = req.body;
    const newUser = new User({ email, username });
    const person = await User.register(newUser, password);
    req.login(person, (err) => {
      if (err) {
        req.flash("error", e.message);
        res.redirect("/user/sign-up");
        return;
      }
      req.flash("success", "Successfully Signed Up! Welcome to Wanderlust");
      res.redirect("/listings");
    });
  })
);
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});
router.post(
  "/login",
    saveReturnPath,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Logged In Successfully");
    res.redirect(res.locals.returnPath || "/listings");
  })
);
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "Logged Out Successfully");
      res.redirect("/listings");
    }
  });
});

module.exports = router;
