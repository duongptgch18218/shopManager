const express = require('express');

const authController = require('../controllers/auth');
const { route } = require('./admin');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/resetPw', authController.getResetPw);

router.post('/resetPw', authController.postResetPw)

router.get('/reset/:token', authController.getSetPw)

router.post('/reset', authController.postSetPw)
module.exports = router;