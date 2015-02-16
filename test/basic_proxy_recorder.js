var pProxy = require('../index');
var request = require('request');
var chai = require('chai').should();

describe('basic_proxy_recorder', function(){
	before(function() {
		pProxy.record({port: 8100, target:'https://api.github.com'});
	});

    it('should proxy all traffic', function(){

    });

	it('should record it to jsons on file system', function(){

	});

	it('should be able to run and response with mocks', function(){
	    pProxy.mock({port: 8101});

	});
});