const async  = require('async');
const config = require('../config');

function init(db, callback) {
	let indexes = {
		[config('mongodb').collectionName]: [
			{ cap: 1 },
			{ codice: 1 }
		]
	};
	
	async.eachSeries(Object.keys(indexes), (collection, cb) => {
		async.eachSeries(indexes[collection], (index, cb1) => {
			let opts = {};
			
			if (index['_unique']) {
				delete index['_unique'];
				opts['unique'] = true;
			}
			
			if (index['_expire']) {
				opts['expireAfterSeconds'] = index['_expire'];
				delete index['_expire'];
			}
			
			db[collection].createIndex(index, opts, cb1);
		}, cb);
	}, callback);
}

module.exports = init;
