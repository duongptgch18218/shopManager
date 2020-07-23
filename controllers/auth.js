const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { validationResult } = require("express-validator");

const User = require("../models/user");

const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "duongptryu@gmail.com",
    pass: "zezdquernlyakesf",
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {email: "", password: ""},
    validationError: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: "/login",
          pageTitle: "Login",
          errorMessage: 'Invalid email',
          oldInput: {email: email, password: password},
          validationError: [{param: 'email'}]
        })
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          return res.status(422).render('auth/login', {
            path: "/login",
            pageTitle: "Login",
            errorMessage: 'Password is not correct',
            oldInput: {email: email, password: password},
            validationError: [{param: 'password'}]
          })
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  return res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {email: "", password: "", confirmPassword: ""},
    validationError: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: error.array()[0].msg,
      oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword},
      validationError: error.array()
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "duongptryu@gmail.com",
        subject: "Signup success",
        html: "<h1>Successfull signed up</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getResetPw = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetPassword", {
    path: "/resetPw",
    pageTitle: "Forgot Password",
    errorMessage: message,
  });
};

exports.postResetPw = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/resetPw");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          res.flash("error", "User dose not exist");
          return res.redirect("/resetPw");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        return transporter.sendMail({
          to: req.body.email,
          from: "duongptgch18218@fpt.edu.vn",
          subject: "Password reset",
          html: `
          <h2>You requested a password reset</h2>
          <p>Click this <a href = "http://localhost:3000/reset/${token}">Link</a> to set a new password</p>
          `,
        });
      })
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getSetPw = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.redirect("/");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/resetPw", {
        path: "/resetPw",
        pageTitle: "Forgot Password",
        errorMessage: message,
        token: token,
        userid: user._id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSetPw = (req, res, next) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const token = req.body.token;
  const userid = req.body.userid;
  let tmp;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userid,
  })
    .then((user) => {
      tmp = user;
      if (password.toString() !== confirmPassword.toString()) {
        req.flash("error", "Password is not correct");
        return res.redirect(`/reset/${token}`);
      }
      return bcrypt.hash(password, 12);
    })
    .then((passwordHash) => {
      tmp.password = passwordHash;
      tmp.resetToken = undefined;
      tmp.resetTokenExpiration = undefined;
      return tmp.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
