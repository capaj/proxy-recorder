module.exports = {
	/**
	 * @param {String} url
	 * @returns {String} alphanumeric string, only non alphanumeric characters possible are . and _
	 */
	urlToFilename: function urlToFilename(url) {
		return url.replace(/[^A-Za-z0-9_.]/g, '_');
	}
};
