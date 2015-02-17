var pProxy = require('../index');
var request = require('request');
var chai = require('chai').should();
var fs = require('fs');

var options = {
	url: 'http://localhost:8100/repos/capaj/proxy-recorder',
	headers: {
		'User-Agent': 'request'
	}
};

//uses github api
describe('basic proxy recorder', function(){
	var respValidation = function(done) {
		return function(error, response, body) {
			JSON.parse(body).id.should.equal(30876859);
			response.statusCode.should.equal(200);

			done();
		};
	};

	before(function(done) {
		pProxy.rec({port: 8100, target:'https://api.github.com'}, done);
	});

    it('should proxy all traffic to target', function(done){
		request(options, respValidation(done));

    });

	it('should record it to jsons on file system', function(){
		fs.existsSync('test/fixtures/https___api.github.com/_repos_capaj_proxy_recorder.json').should.equal(true);
	});

	it('should be able to run and response with mocks', function(done){
	    pProxy.mock({port: 8101, mockDir: 'test/fixtures/https___api.github.com/'});
		options.url = 'http://localhost:8101/repos/capaj/proxy-recorder';
		request(options, respValidation(done));
	});
});