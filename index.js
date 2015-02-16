var httpProxy = require('http-proxy');
var http = require('http');
var morgan = require('morgan')('dev');
var connect = require('connect');
var record = require('./lib/record');

module.exports = {
	/**
	 * @param {Object} opts is used for proxy.web method call
	 * @param {Object} opts.port is used as port to listen on
	 * @param {Function} cb
	 */
	record: function record(opts, cb) {
		var app = connect()
			.use(morgan)
			.use(function(req, res){

				var proxy = httpProxy.createProxyServer({changeOrigin: true});	//be default we changeOrigin, ssl
				// enabled APIs like github throw Hostname/IP doesn't match certificate's altnames when this is not enabled

				proxy.web(req, res, opts, function(error) {
					if (error) {
						throw error;
					}
					record(req, res);
					console.log("res", res);
				});
			});

		http.createServer(app).listen(opts.port, function() {
			console.log("listening");
			if (cb) {
				cb();
			}
		});
	},
	mock: function mock() {
		var app = connect()
			.use(morgan)
			.use(function(req, res){

			});
	}
};