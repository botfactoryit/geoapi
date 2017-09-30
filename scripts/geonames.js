const fs     = require('fs');
const async  = require('async');
const needle = require('needle');

let content = fs.readFileSync('IT.txt').toString();

let coordinates = [];

console.log('Parsing input file...');

content.split('\n').forEach((line) => {
	let parts = line.split('\t');
	
	// Keep only adm3 lines
	if (parts[7] != 'ADM3') {
		return;
	}
	
	coordinates.push({
		istat: parts[12],
		lat: parts[4],
		lon: parts[5]
	});
});

console.log('Done. Importing in to tile38...');

const tile38Url = 'http://localhost:9851';

async.eachOfSeries(coordinates, (item, index, callback) => {
	let { istat, lat, lon } = item;
	
	let command = `SET geonames ${istat} POINT ${lat} ${lon}`;
	
	console.log(`Importing ${istat} => ${index}/${coordinates.length}`);
	
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
