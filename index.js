var httpProxy = require('http-proxy');
var http = require('http');
var morgan = require('morgan')('dev');
var connect = require('connect');
var record = require('./lib/record');
var utils = require('./lib/utils');
var mkpath = require('mkpath');
var EventEmitter = require('events').EventEmitter;
var recorder = new EventEmitter();
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');

/**
 * @param {Object} opts is used for proxy.web method call
 * @param {Object} opts.port is used as port to listen on
 * @param {Function} [cb] if not passed, promise is returned
 * @returns {Promise} if no cb was supplied
 */
recorder.rec = function rec(opts, cb) {
	var proxy = httpProxy.createProxyServer({changeOrigin: true});	//be default we changeOrigin, because

	// ssl enabled APIs like github throw Hostname/IP doesn't match certificate's altnames when this is not enabled
	var defaultPath = 'test/fixtures/' + utils.urlToFilename(opts.target);

	var mockPath = opts.mockPath || defaultPath;
	mkpath.sync(mockPath);

	var bodies = {};
	proxy.on('proxyRes', function(proxyRes, req, res) {

		var body = bodies[req._header];
		if (body) {
			req.body = body;
		}
		record(req, proxyRes, mockPath);
	});

	var app = connect()
		.use(morgan)
		.use(function(req, res){

			var body = '';
			req.on('data', function (data) {
				body += data;
				if (body.length > 1e12) {
					console.error('Too much POST data, kill the connection!');
					req.connection.destroy();
				}
			});
			req.on('end', function () {
				bodies[req._header] = body.toString();
			});

			proxy.web(req, res, opts, function(error) {
				if (error) {
					throw error;
				}
			});
		});

	var dfd;
	http.createServer(app).listen(opts.port, function() {
		console.log("proxy-recorder listening on ", opts.port);
		utils.callbackOrResolve(cb, dfd);
	});

	if(!cb){
		dfd = Promise.defer();
		return dfd.promise;
	}
};

/**
 * @param {Object} opts
 * @param {Function} [cb] if not provided a callback, promise is returned
 * @returns {Promise} if no cb was supplied
 */
recorder.mock = function mock(opts, cb) {
	var mockDir = opts.mockDir || 'test/fixtures/' + utils.urlToFilename(opts.target);
	var app = connect()
		.use(morgan)
		.use(function(req, res){

			var reqBody = '';
			req.on('data', function (data) {
				reqBody += data;
				if (reqBody.length > 1e12) {
					console.error('Too much POST data, kill the connection!');
					req.connection.destroy();
				}
			});
			req.on('end', function () {
				req.body = reqBody.toString();
				var fileName = utils.buildFileName(req.url, req);

				var mockFile = path.join(mockDir, fileName);
				fs.readFile(mockFile, 'utf8', function(err, file) {
					if (err) {
						res.writeHead(404);
					} else {
						var mock = JSON.parse(file);

						res.writeHead(mock.statusCode, mock.headers);
						var data = mock.data;
						if (typeof data === 'object') {
							data = JSON.stringify(data);
						}

						res.write(data);
					}

					res.end();
				});
			});

		});

	var dfd;
	http.createServer(app).listen(opts.port, function() {
		console.log("proxy-recorder listening on ", opts.port);
		utils.callbackOrResolve(cb, dfd);
	});

	if(!cb){
		dfd = Promise.defer();
		return dfd.promise;
	}

};

module.exports = recorder;