'use strict';

const Joi = require('joi');
const { ObjectId } = require('mongodb');

const { logger } = require('../../config/logger');
const { clients } = require('../../database/MongoDB');

exports.userRegister = async (req, res, next) => {
	try {
		logger.info({ requestId: req.id, message: `ip: ${req.ip}  ${req.method}/  ${req.originalUrl} user register received` });

		/** Passing the reques details into validater */
		const { error } = await validate(req.body);

		/** Check if any error is available request data if error occured pass into UI */
		if (error) {
			const errorMessage = error?.details && error?.details.length && error?.details[0]?.message ? error?.details[0]?.message : 'Missing required Field';
			return res.status(400).json({
				message: errorMessage
			});
		}

		const client = await clients();
		const db = client.db('voosh');

		// Assuming registration details are in req.body
		const userDetails = req.body;

		// Check the user is already registered
		const userIsExist = await db.collection('profiledetails').findOne({ email: req.body.email }, { projection: { _id: 1 } });
		if (!userIsExist?._id) {
			// Insert user details into the database
			await db.collection('profiledetails').insertOne({ ...userDetails, createdAt: new Date(), isDeleted: false, role: 'user' });

			return res.status(201).json({
				Message: 'Successfully user registered.'
			});
		}

		return res.status(200).json({
			Message: 'User already Exist'
		});
	} catch (error) {
		logger.error({ requestId: req.id, message: `Error in register user, Error -> ${error.message}` });
		next(error);
	}
};

exports.getProfileDetails = async (req, res, next) => {
	try {
		logger.info({ requestId: req.id, message: `ip: ${req.ip}  ${req.method}/  ${req.originalUrl} user profile details fetch req received` });

		const isValid = ObjectId.isValid(req.params?.id);

		if (!isValid) {
			return res.status(400).json({
				Message: 'Not a valid details'
			});
		}

		const client = await clients();
		const db = client.db('voosh');

		// Check the user is already registered
		const userIsExist = await db
			.collection('profiledetails')
			.findOne({ _id: new ObjectId(String(req.params.id)) }, { projection: { password: 0, repeat_password: 0, createdAt: 0, role: 0, updatedAt: 0 } });
		if (userIsExist?.email) {
			return res.status(200).json({
				Message: 'Successfully user details retrived.',
				data: userIsExist
			});
		}

		return res.status(200).json({
			Message: 'User details is not found'
		});
	} catch (error) {
		logger.error({ requestId: req.id, message: `Error in get user, Error -> ${error.message}` });
		next(error);
	}
};

exports.updateProfile = async (req, res, next) => {
	try {
		logger.info({ requestId: req.id, message: `ip: ${req.ip}  ${req.method}/  ${req.originalUrl} user profile update req received` });

		const isValid = ObjectId.isValid(req.params?.id);

		if (!isValid) {
			return res.status(400).json({
				Message: 'Not a valid details'
			});
		}

		/** Passing the reques details into validater */
		const { error } = await validate(req.body);

		/** Check if any error is available request data if error occured pass into UI */
		if (error) {
			const errorMessage = error?.details && error?.details.length && error?.details[0]?.message ? error?.details[0]?.message : 'Missing required Field';
			return res.status(400).json({
				message: errorMessage
			});
		}

		const client = await clients();
		const db = client.db('voosh');

		const userIsExist = await db.collection('profiledetails').findOne({ email: req.body.email }, { projection: { _id: 1 } });
		if (userIsExist?._id) {
			return res.status(200).json({
				Message: "You can't use this email please use another email."
			});
		} else {
			delete req?.body?.role;
			const userIsupdated = await db.collection('profiledetails').updateOne({ _id: new ObjectId(String(req.params.id)) }, { $set: { ...req.body, updatedAt: new Date(), isDeleted: false } });
			if (userIsupdated?.modifiedCount) {
				return res.status(200).json({
					Message: 'User details updated successfully.'
				});
			}
			return res.status(200).json({
				Message: 'User details not updated.'
			});
		}
	} catch (error) {
		logger.error({ requestId: req.id, message: `Error in update user, Error -> ${error.message}` });
		next(error);
	}
};

exports.getUsrerProfiles = async (req, res, next) => {
	try {
		logger.info({ requestId: req.id, message: `ip: ${req.ip}  ${req.method}/  ${req.originalUrl} user profile get all req received` });

		const isValid = ObjectId.isValid(req.params?.id);

		if (!isValid) {
			return res.status(400).json({
				Message: 'Not a valid details'
			});
		}

		const client = await clients();
		const db = client.db('voosh');

		const userIsExist = await db.collection('profiledetails').findOne({ _id: new ObjectId(String(req.params.id)) }, { projection: { _id: 1, role: 1 } });
		if (userIsExist?._id && userIsExist?.role === 'admin') {
			const allUserDetails = await db
				.collection('profiledetails')
				.find({ isDeleted: false }, { projection: { password: 0, repeat_password: 0, createdAt: 0, role: 0, updatedAt: 0 } })
				.toArray();

			return res.status(200).json({
				Message: "You can't use this email please use another email.",
				data: allUserDetails
			});
		} else if (userIsExist?._id && userIsExist?.role === 'user') {
			const userDetails = await db
				.collection('profiledetails')
				.find({ isDeleted: false, role: 'user', profile_type: 'public' }, { projection: { password: 0, repeat_password: 0, createdAt: 0, role: 0, updatedAt: 0 } })
				.toArray();

			return res.status(200).json({
				Message: 'User details updated successfully.',
				data: userDetails
			});
		}
	} catch (error) {
		logger.error({ requestId: req.id, message: `Error in get all user, Error -> ${error.message}` });
		next(error);
	}
};

exports.userLogin = async (req, res, next) => {
	try {
		return res.redirect('/auth/google/callback');
	} catch (error) {
		next(error);
	}
};

exports.authFail = async (req, res, next) => {
	try {
		return res.status(201).json({
			Message: 'Unauthorized access'
		});
	} catch (error) {
		next(error);
	}
};

exports.userLogout = async (req, res, next) => {
	try {
		logger.info({ requestId: req.id, message: `ip: ${req.ip}  ${req.method}/  ${req.originalUrl} user logout req received` });

		req.logout(err => {
			if (err) {
				return next(err);
			}
			req.session.destroy(err => {
				if (err) {
					return next(err);
				}
				return res.status(201).json({
					Message: 'Logout Successfully.'
				});
			});
		});
	} catch (error) {
		logger.error({ requestId: req.id, message: `Error in logout user, Error -> ${error.message}` });
		next(error);
	}
};

// -----------------------  Common validator for the user register and update user ------------------ //

const validate = body => {
	/** Joi validator using validate the request data */
	const schema = Joi.object().keys({
		username: Joi.string().alphanum().min(8).max(30).required().messages({
			'any.required': 'Username is required'
		}),
		password: Joi.string().min(6).required().messages({
			'any.required': 'password is required'
		}),
		repeat_password: Joi.string().required().valid(Joi.ref('password')).messages({
			'any.only': 'Passwords do not match'
		}),
		bio: Joi.string()
			.regex(/^\d{2}\/\d{2}\/\d{4}$/)
			.required()
			.messages({
				'any.required': 'Bio-Data is required'
			}),
		phone: Joi.number().integer().min(10).required().messages({ 'any.required': 'Phone is required' }),
		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
			.required()
			.messages({
				'any.required': 'Email is required'
			}),
		photo: Joi.string().required().messages({
			'any.required': 'Photo is required'
		}),
		profile_type: Joi.string().required().messages({
			'any.required': 'Profile type is required'
		})
	});

	/** Passing the reques details into validater */
	return schema.validate(body);
};
