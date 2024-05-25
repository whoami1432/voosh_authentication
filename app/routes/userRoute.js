'use strict';

const express = require('express');

const router = express.Router();

const { ensureAuthenticated } = require('../../middlewares/auth');
const user = require('../controllers/user');

router.post('/register', user.userRegister);
router.get('/profile/:id', ensureAuthenticated, user.getProfileDetails);
router.put('/update/profile/:id', ensureAuthenticated, user.updateProfile);
router.get('/users/profile/:id', ensureAuthenticated, user.getUsrerProfiles);
router.get('/authfail', user.authFail);
router.get('/login', user.userLogin);
router.get('/logout', user.userLogout);

module.exports = router;
