'use strict';

const express = require('express');
const helmet = require('helmet');
require('dotenv').config();
const compression = require('compression');
const cors = require('cors');
const hpp = require('hpp');
const expressMongoanitaize = require('express-mongo-sanitize');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Helper function files
const helloWorldRoute = require('./app/routes/helloWorld.route');
const { requestId } = require('./service/uuidGenerator');
const { consoleWritter } = require('./service/consoleViewer');
const notFound = require('./middlewares/notFound');
const erorrHandler = require('./middlewares/errorHandler');
const { limiter } = require('./middlewares/rateLimiter');
const everyReqDetails = require('./middlewares/everyReqCatcher');
const MongoDB = require('./database/MongoDB');

// Route files
const userRoute = require('./app/routes/userRoute');

const { PORT: port, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_SECRET_KEY, GOOGLE_CALLBACK_URL } = process.env;

process.on('uncaughtException', error => {
	console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled rejection:', error);
});

MongoDB.mongoConnect();

// Swagger set up
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Voosh user authentication',
			version: '1.0.0',
			description: 'This API used for the user register and authentication and managing the user details.'
		},
		servers: [
			{
				url: 'http://localhost:5050/api/v1/user'
			}
		]
	},
	apis: ['./server.js', './app/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Configure session middleware
app.use(
	session({
		secret: GOOGLE_SECRET_KEY,
		resave: false,
		saveUninitialized: true
	})
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth 2.0 Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			callbackURL: GOOGLE_CALLBACK_URL
		},
		(accessToken, refreshToken, profile, done) => {
			return done(null, profile);
		}
	)
);

// Serialize user
passport.serializeUser((user, done) => {
	done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
	done(null, user);
});

app.use(limiter);
app.use(expressMongoanitaize());
app.use(hpp());
app.use('*', cors());
app.use(compression({ level: 1 }));
app.use(requestId);
app.use(helmet());
app.use(express.json({ extended: true }));
app.use(everyReqDetails);

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/api/v1/user/authfail', scope: ['email', 'profile'] }), async (req, res) => {
	if (req.user._json.email) {
		const client = await MongoDB.clients();
		const db = client.db('voosh');
		const userIsExist = await db.collection('profiledetails').findOne({ email: req.user._json.email }, { projection: { _id: 1 } });
		if (!userIsExist) {
			req.session.destroy(err => {
				if (err) {
					return next(err);
				}
				return res.status(401).json({
					Message: 'Please Register'
				});
			});
		} else {
			// Successful authentication, redirect home.
			return res.redirect('/');
		}
	}
});

app.use('/api/', helloWorldRoute);
app.use('/api/v1/user/', userRoute);

app.get('/', (req, res) => res.status(200).send('Hello World!'));

// error handlers
app.use('*', notFound);
app.use(erorrHandler);

app.listen(port, () => {
	consoleWritter(port);
});
