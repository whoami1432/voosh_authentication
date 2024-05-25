'use strict';

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_CONNECTION_STRING;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	},
	monitorCommands: true
});

client.on('connectionCreated', connectionCreated => console.log({ connectionCreated }));
client.on('connectionClosed', connectionClosed => console.log({ connectionClosed }));

async function mongoConnect() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		client.on('commandStarted', commandStarted => console.debug({ commandStarted }));
		client.on('commandFailed', commandFailed => console.debug({ commandFailed }));
		client.on('error', error => console.debug({ error }));
		client.on('connectionPoolCreated', connectionPoolCreated => console.debug({ connectionPoolCreated }));
		return client;
	} catch (err) {
		console.error('Database connection Error. Check the mongodb connection... ');
		process.exit();
	}
}

const clients = () => {
	// Check if client is connected
	if (client.topology?.s?.state === 'connected') {
		return client;
	}
	return mongoConnect();
};

module.exports = { mongoConnect, clients };
