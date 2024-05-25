'use strict';

const express = require('express');

const router = express.Router();

const { ensureAuthenticated } = require('../../middlewares/auth');
const user = require('../controllers/user');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Store the user details in database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - repeat_password
 *               - email
 *               - bio
 *               - phone
 *               - photo
 *               - profile_type
 *             properties:
 *               username:
 *                 type: string
 *                 example: saravana
 *               password:
 *                 type: string
 *                 format: password
 *                 example: check1
 *               repeat_password:
 *                 type: string
 *                 format: password
 *                 example: check1
 *               email:
 *                 type: string
 *                 format: email
 *                 example: saravana3@gmail.com
 *               bio:
 *                 type: string
 *                 example: 05/12/2000
 *               phone:
 *                 type: integer
 *                 example: 6381192018
 *               photo:
 *                 type: string
 *                 example: rerte
 *               profile_type:
 *                 type: string
 *                 enum: [public, private]
 *                 example: public
 *     responses:
 *       200:
 *         description: Successful registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/register', user.userRegister);

/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     summary: Returns a single user details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
 *                   example: Successfully user details retrieved.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 66518bed9e3f98047eec3b71
 *                     username:
 *                       type: string
 *                       example: saravana0
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: saravana0@gmail.com
 *                     bio:
 *                       type: string
 *                       example: 05/12/2000
 *                     phone:
 *                       type: integer
 *                       example: 6381192018
 *                     photo:
 *                       type: string
 *                       example: rerte0
 *                     profile_type:
 *                       type: string
 *                       enum: [private, public]
 *                       example: private
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *             example:
 *               Message: Successfully user details retrieved.
 *               data:
 *                 _id: 66518bed9e3f98047eec3b71
 *                 username: saravana0
 *                 email: saravana0@gmail.com
 *                 bio: 05/12/2000
 *                 phone: 6381192018
 *                 photo: rerte0
 *                 profile_type: private
 *                 isDeleted: false
 */
router.get('/profile/:id', ensureAuthenticated, user.getProfileDetails);

/**
 * @swagger
 * /update/profile/{id}:
 *   put:
 *     summary: Update a user's profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *               phone:
 *                 type: integer
 *               photo:
 *                 type: string
 *               profile_type:
 *                 type: string
 *                 enum: [public, private]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.put('/update/profile/:id', ensureAuthenticated, user.updateProfile);

/**
 * @swagger
 * /users/profile/{id}:
 *   get:
 *     summary: Returns multiple user profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 66518bed9e3f98047eec3b71
 *                   username:
 *                     type: string
 *                     example: saravana0
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: saravana0@gmail.com
 *                   bio:
 *                     type: string
 *                     example: 05/12/2000
 *                   phone:
 *                     type: integer
 *                     example: 6381192018
 *                   photo:
 *                     type: string
 *                     example: rerte0
 *                   profile_type:
 *                     type: string
 *                     enum: [private, public]
 *                     example: private
 *                   isDeleted:
 *                     type: boolean
 *                     example: false
 */
router.get('/users/profile/:id', ensureAuthenticated, user.getUsrerProfiles);

router.get('/authfail', user.authFail);
router.get('/login', user.userLogin);
router.get('/logout', user.userLogout);

module.exports = router;