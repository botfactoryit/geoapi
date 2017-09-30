const fs     = require('fs');
const async  = require('async');
const needle = require('needle');

console.log('Parsing input file...');

const data = JSON.parse(fs.readFileSync('out.geojson').toString());
const features = data['features'];

console.log('Done. Importing in to tile38...');

const tile38Url = 'http://localhost:9851';

async.eachOfSeries(features, (item, index, callback) => {
	let istat = item['properties']['PRO_COM'].toString();
	istat = ('000' + istat).slice(-6);
	
	let geometry = JSON.stringify(item['geometry']);
	
	let command = `SET istat ${istat} OBJECT ${geometry}`;
	
	console.log(`Importing ${istat} => ${index}/${features.length}`);
	
	needle.post(tile38Url, command, (err, response) => {
		if (err) {
			throw err;
		}
		
		if (response.body.ok === true) {
			callback();
		}
		else {
			console.log(response.body);
			throw new Error('response error');
		}
	});
}, () => {
	console.log('Done.');
});
