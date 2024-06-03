const express = require("express");
const userRoutes = express.Router();
const manageSessions = require("../middlewares/userAuthentication");
const {
  createAccount,
  login,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/userControllers");

userRoutes.post("/signUp", createAccount);
userRoutes.post("/login", login);
userRoutes.post("/forgotPassword", forgotPassword);
userRoutes.patch("/resetPassword/:token", resetPassword);
userRoutes.delete("/logout", manageSessions, logout);
module.exports = userRoutes;
