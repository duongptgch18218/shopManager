const express = require("express");

const { check, body } = require("express-validator/check");
const User = require("../models/user");

const authController = require("../controllers/auth");
const { route } = require("./admin");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please input valid email")
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
          return true;
        });
      }),
    body(
      "password",
      "Please enter a password with only number and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password is not match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post(
  "/logout",
  [
    check("email", "Pleaseinput valid email").isEmail().normalizeEmail().trim(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must to be greater than 5 character!")
      .trim(),
  ],
  authController.postLogout
);

router.get("/resetPw", authController.getResetPw);

router.post("/resetPw", authController.postResetPw);

router.get("/reset/:token", authController.getSetPw);

router.post("/reset", authController.postSetPw);
module.exports = router;
