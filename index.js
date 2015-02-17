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

/**
 * @param {Object} opts is used for proxy.web method call
 * @param {Object} opts.port is used as port to listen on
 * @param {Function} cb
 */
recorder.rec = function rec(opts, cb) {
	var app = connect()
		.use(morgan)
		.use(function(req, res){

			var proxy = httpProxy.createProxyServer({changeOrigin: true});	//be default we changeOrigin, because
			// ssl enabled APIs like github throw Hostname/IP doesn't match certificate's altnames when this is not enabled
			var defaultPath = 'test/fixtures/' + utils.urlToFilename(opts.target);

			var mockPath = opts.mockPath || defaultPath;
			mkpath.sync(mockPath);

			proxy.on('proxyRes', function(proxyRes, req, res) {

				record(req, proxyRes, mockPath);
			});
			proxy.web(req, res, opts, function(error) {
				if (error) {
					throw error;
				}
			});
		});

	http.createServer(app).listen(opts.port, function() {
		console.log("proxy-recorder listening on ", opts.port);
		if (cb) {
			cb();
		}
	});
};

/**
 *
 * @param {Object} opts
 * @param {Function} cb
 */
recorder.mock = function mock(opts, cb) {
	var mockDir = opts.mockDir || 'test/fixtures/';
	var app = connect()
		.use(morgan)
		.use(function(req, res){
			var mockFile = path.join(mockDir, utils.urlToFilename(req.url) + '.json');
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

	http.createServer(app).listen(opts.port, function() {
		console.log("proxy-recorder listening on ", opts.port);
		if (cb) {
			cb();
		}
	});
};

module.exports = recorder;