var zlib = require('zlib');
var utils = require('utils');

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

function serializeResponse(req, res, data) {
	var response = {
		requestUrl: res.req.path,
		headers: res.headers,
		statusCode: res.statusCode,
		data: parseJsonResponse(res, data)
	};

	var path = utils.getMockPath(req);

	mock.save(response, path);
	console.error('Serialized response for ' + res.req.path + ' to ' + path);
}


module.exports = function handleResponse(req, res) {
	uncompress(res, function(res, data) {
		serializeResponse(req, res, data);
	});
};