const zlib = require('zlib')
const utils = require('./utils')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

function uncompress (res, callback) {
  const contentEncoding = res.headers['content-encoding']

  let stream = res

  if (contentEncoding === 'gzip') {
    stream = zlib.createGunzip()
    res.pipe(stream)
  } else if (contentEncoding === 'deflate') {
    stream = zlib.createInflate()
    res.pipe(stream)
  }

  const buffer = []
  stream.on('data', function (data) {
    buffer.push(data.toString())
  }).on('end', function () {
    callback(res, buffer.join(''))
  }).on('error', function (e) {
    console.error('An error occurred during decompression: ' + e)
  })
}

function parseJsonResponse (res, data) {
  const contentType = res.headers['content-type']
  if (_.includes(contentType, 'json') || _.includes(contentType, 'javascript')) {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error('Could not parse JSON for response of ' + res.req.path)
    }
  }
  return data
}

/**
 * @param {Object} req
 * @param {Object} res
 * @param {String} prePath
 */
module.exports = function recResponse (req, res, prePath) {
  uncompress(res, function (res, data) {
    const response = {
      requestUrl: res.req.path,
      headers: res.headers,
      statusCode: res.statusCode,
      data: parseJsonResponse(res, data)
    }

    let filePath = utils.buildFileName(res.req.path, req)

    filePath = path.join(prePath, filePath)

    fs.writeFile(filePath, JSON.stringify(response, null, 4), function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('File was saved: ', filePath)
      }
    })

    console.error('Serialized response for ' + res.req.path + ' to ' + filePath)
  })
}
