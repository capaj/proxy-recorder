var pProxy = require('../index');
var request = require('request');
var chai = require('chai').should();

var options = {
	url: 'http://localhost:8100/repos/capaj/proxy-recorder',
	headers: {
		'User-Agent': 'request'
	}
};

//uses github api
describe('basic proxy recorder', function(){
	before(function(done) {
		pProxy.record({port: 8100, target:'https://api.github.com'}, done);
	});

    it('should proxy all traffic to target', function(done){

		request(options, function (error, response, body) {
			JSON.parse(body).id.should.equal(30876859);
			response.statusCode.should.equal(200);

			done()
		})

    });

	it('should record it to jsons on file system', function(){

	});

	it('should be able to run and response with mocks', function(){
	    //pProxy.mock({port: 8101});

	});
});