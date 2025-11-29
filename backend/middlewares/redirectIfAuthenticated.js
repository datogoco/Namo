function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("User is already authenticated, redirecting to /dashboard");
    return res.redirect("/dashboard");
  }
  next();
}

module.exports = redirectIfAuthenticated;
