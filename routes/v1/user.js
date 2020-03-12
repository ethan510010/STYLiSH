const express = require('express');

const router = express.Router();
const { userSignin, userSignup, getUserProfie } = require('../../controller/v1/user');
const { checkTokenExpired } = require('../../middleware/checkTokenExpired');
const { checkRepeatedEmail } = require('../../middleware/checkUserExists');
const { checkValidEmailAndPassword } = require('../../middleware/checkValidEmailAndPassword');
const { validateEmail } = require('../../middleware/validateEmail');

router.post('/signup', validateEmail, checkRepeatedEmail, userSignup);

router.post('/signin', checkValidEmailAndPassword, userSignin);

router.get('/profile', checkTokenExpired, getUserProfie);

module.exports = router;
