const Joi    = require('joi');
const Boom   = require('boom');
const needle = require('needle');
const db     = require('../db');
const config = require('../config');

const TILE38_URL = config('tile38').url;
const POINTS_COLLECTION_NAME = config('tile38').pointsCollectionName;
const POLYGONS_COLLECTION_NAME = config('tile38').polygonsCollectionName;

let get = {
	method: 'GET',
	path: '/comune',
	handler(request, reply) {
		let { istat, cap, lat, lon } = request.query;
		
		if (istat || cap) {
			let fn;
			
			if (istat) {
				fn = db.comuni.getByIstat.bind(null, istat);
			}
			else {
				fn = db.comuni.getByCap.bind(null, cap);
			}
			
			fn((err, comune) => {
				if (err) {
					reply(Boom.internal());
					return;
				}
				
				if (!comune) {
					reply(Boom.notFound());
					return;
				}
				
				let query = `GET ${POINTS_COLLECTION_NAME} ${comune.codice}`;
				
				needle.post(TILE38_URL, query, (err, response) => {
					if (err) {
						request.log('error', { message: 'tile38: ' + err.message, err });
						reply(Boom.serverUnavailable());
						return;
					}
					
					if (response.body.ok === true) {
						comune['lat'] = response.body['object']['coordinates'][1];
						comune['lon'] = response.body['object']['coordinates'][0];
						
						reply(comune);
					}
					else {
						request.log('error', 'tile38: ' + response.body.err);
						
						if (response.body.err.includes('not found')) {
							reply(Boom.notFound());
						}
						else {
							reply(Boom.serverUnavailable());
						}
					}
				});
			});
		}
		else if (lat && lon) {
			// TODO: query tile38
		}
	},
	config: {
		validate: {
			query: Joi.alternatives().try([
				{
					istat: Joi.string().regex(/^[0-9]{6}$/).required()
				},
				{
					cap: Joi.string().regex(/^[0-9]{5}$/).required()
				},
				{
					lat: Joi.number().min(-90).max(90).required(),
					lon: Joi.number().min(-180).max(180).required()
				}
			])
		}
	}
};

module.exports = [get];
