module.exports = {
	getMockPath: function getMockPath(request) {
		return request.path.replace(/\?|\&/, '_');
	}
};
