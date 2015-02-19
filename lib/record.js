var zlib = require('zlib');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var crypto = require('crypto');

function uncompress(res, callback) {
	var contentEncoding = res.headers['content-encoding'];

	var stream = res;

	if (contentEncoding === 'gzip') {
		stream = zlib.createGunzip();
		res.pipe(stream);
	} else if (contentEncoding === 'deflate') {
		stream = zlib.createInflate();
		res.pipe(stream);
	}

	var buffer = [];
	stream.on('data', function(data) {
		buffer.push(data.toString());
	}).on('end', function() {
		callback(res, buffer.join(''));
	}).on('error', function(e) {
		console.error('An error occurred during decompression: ' + e);
	});
}

function parseJsonResponse(res, data) {
	var contentType = res.headers['content-type'];
	if (_.contains(contentType, 'json') || _.contains(contentType, 'javascript')) {
		try {
			return JSON.parse(data);
		} catch (e) {
			console.error('Could not parse JSON for response of ' + res.req.path);
		}
	}
	return data;
}


module.exports = function recResponse(req, res, prePath) {
	uncompress(res, function(res, data) {
		var response = {
			requestUrl: res.req.path,
			headers: res.headers,
			statusCode: res.statusCode,
			data: parseJsonResponse(res, data)
		};

		var filePath = utils.urlToFilename(res.req.path);
		var shasum = crypto.createHash('sha1');
		shasum.update(data);
		filePath += shasum.digest('hex');
		filePath = path.join(prePath, filePath) + '.json';

		fs.writeFile(filePath, JSON.stringify(response, null, 4), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("File was saved: ", filePath);
			}
		});

		console.error('Serialized response for ' + res.req.path + ' to ' + filePath);
	});
};