const logger  = require('bole')('db');
const mongojs = require('mongojs');
const config  = require('../config');
const init    = require('./init.js');

const dbOptions = { connectTimeoutMS: 5000 };
const db = mongojs(config('db').connectionString, null, dbOptions);

const COLLECTION_NAME = config('db').collectionName;

db.on('error', (err) => {
	throw err;
});

db.on('connect', () => {
	logger.info('DB connected');
});

db.on('timeout', () => {
	throw new Error('DB timeout');
});

init(db, (err) => {
	if (err) {
		throw err;
	}
	
	logger.info('DB initialized');
});

let comuni = {
	getByIstat(istat, callback) {
		let query = { codice: istat };
		
		let projection = {
			_id: false
		};
		
		db[COLLECTION_NAME].findOne(query, projection, callback);
	},
	getByCap(cap, callback) {
		let query = { cap: cap };
		
		let projection = {
			_id: false
		};
		
		db[COLLECTION_NAME].findOne(query, projection, callback);
	}
};

module.exports = {
	comuni
};
