const fs = require('fs');
const path = require('path');

module.exports.register = function(server, options, next) {
	fs.readdir(options['directory'], (err, list) => {
		if (err) {
			next(err);
			return;
		}
		
		list.forEach((f) => {
			if (f.endsWith('.js')) {
				let p = path.join(options['directory'], f);
				let routes = require(p);
				
				if (Array.isArray(routes)) {
					routes.forEach((route) => {
						server.route(route);
					});
				}
			}
		});
		
		next();
	});
};

module.exports.register.attributes = {
	name: 'routes',
	version: '1.0.0'
};
