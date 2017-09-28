const logger = require('bole')('server');
const Hapi   = require('hapi');

const config  = require('./config');

// Create the HTTP server
const server = new Hapi.Server({
	useDomains: false,
	debug: false,
	connections: {
		router: {
			stripTrailingSlash: true,
			isCaseSensitive: false
		}
	}
});

server.connection({
	host: '0.0.0.0',
	port: config('server').port || 8080
});

server.on('request', (request, event, tags) => {
	if (tags.error) {
		let r = {
			method: request.method,
			path: request.url.path,
			headers: request.headers,
			remoteAddress: request.connection.remoteAddress,
			payload: request.payload
		};
		
		let error = null;
		if (event['data'] instanceof Error) {
			error = {
				message: event['data']['message'],
				name: event['data']['name'],
				stack: event['data']['stack']
			};
		}
		else {
			error = event['data'];
		}
		
		let log = { request: r, error: error };
		
		logger.error(log);
	}
	else {
		logger[event['tags'][0]](event['data']);
	}
});

server.on('log', (event, tags) => {
	if (tags.error) {
		// Ignore connection errors
		if (!tags.connection) {
			logger.error(event['data']);
		}
	}
	else if (tags.load) {
		logger.warn(event['data']);
	}
	else {
		logger[event['tags'][0]](event['data']);
	}
});

server.on('response', (request) => {
	let text = request.method.toUpperCase() + ' ' + request.url.path + ' ' + (request.response.statusCode || '-');
	
	server.log('info', text);
});

server.register({ register: require('./plugins/routes.js'), options: { directory: __dirname + '/routes' } }, (err) => {
	if (err) {
		throw err;
	}
	
	server.start((err) => {
		if (err) {
			throw err;
		}
		
		server.log('info', 'Server running at ' + server.info.uri);
	});
});

module.exports = server;
