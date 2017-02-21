var crypto = require('crypto')

var self = {
  /**
   * @param {String} url
   * @returns {String} alphanumeric string, only non alphanumeric characters possible are . and _
   */
  urlToFilename: function urlToFilename (url) {
    return url.replace(/[^A-Za-z0-9_.]/g, '_')
  },
  /**
   *
   * @param {String} url
   * @param {Object} req
   * @returns {String}
   */
  buildFileName: function (url, req) {
    var body = req.body
    var sha
    if (Buffer.isBuffer(body) || (typeof body === 'string' && body.length > 0)) {
      var shasum = crypto.createHash('sha1')
      shasum.update(body)
      sha = shasum.digest('hex')
    } else {
      sha = ''
    }
    return req.method + self.urlToFilename(url) + sha + '.json'
  }
}

module.exports = self
