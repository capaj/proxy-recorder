const httpProxy = require('http-proxy')
const http = require('http')
const morgan = require('morgan')('dev')
const connect = require('connect')
const record = require('./lib/record')
const utils = require('./lib/utils')
const mkpath = require('mkpath')
const EventEmitter = require('events').EventEmitter
const recorder = new EventEmitter()
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')

/**
 * @param {Object} opts is used for proxy.web method call
 * @param {Object} opts.port is used as port to listen on
 * @returns {Promise} if no cb was supplied
 */
recorder.rec = function rec (opts) {
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true
  }) // be default we changeOrigin, because

  // ssl enabled APIs like github throw Hostname/IP doesn't match certificate's altnames when this is not enabled
  const defaultPath = 'test/fixtures/' + utils.urlToFilename(opts.target)

  const mockPath = opts.mockPath || defaultPath
  mkpath.sync(mockPath)

  const bodies = {}
  proxy.on('proxyRes', function (proxyRes, req, res) {
    const body = bodies[req._header]
    if (body) {
      req.body = body
    }
    record(req, proxyRes, mockPath)
  })

  const app = connect()
    .use(morgan)
    .use(function (req, res) {
      let body = ''
      req.on('data', function (data) {
        body += data
        if (body.length > 1e12) {
          console.error('Too much POST data, kill the connection!')
          req.connection.destroy()
        }
      })
      req.on('end', function () {
        bodies[req._header] = body.toString()
      })

      proxy.web(req, res, opts, function (error) {
        if (error) {
          throw error
        }
      })
    })

  return new Promise((resolve, reject) => {
    http.createServer(app).listen(opts.port, function () {
      console.log('proxy-recorder listening on ', opts.port)
      resolve()
    })
  })
}

/**
 * @param {Object} opts
 * @returns {Promise} if no cb was supplied
 */
recorder.mock = function mock (opts) {
  const mockDir = opts.mockDir || 'test/fixtures/' + utils.urlToFilename(opts.target)
  const app = connect()
    .use(morgan)
    .use(function (req, res) {
      let reqBody = ''
      req.on('data', function (data) {
        reqBody += data
        if (reqBody.length > 1e12) {
          console.error('Too much POST data, kill the connection!')
          req.connection.destroy()
        }
      })
      req.on('end', function () {
        req.body = reqBody.toString()
        const fileName = utils.buildFileName(req.url, req)

        const mockFile = path.join(mockDir, fileName)
        fs.readFile(mockFile, 'utf8', function (err, file) {
          if (err) {
            res.writeHead(404)
          } else {
            const mock = JSON.parse(file)

            res.writeHead(mock.statusCode, mock.headers)
            let data = mock.data
            if (typeof data === 'object') {
              data = JSON.stringify(data)
            }

            res.write(data)
          }

          res.end()
        })
      })
    })

  return new Promise((resolve, reject) => {
    http.createServer(app).listen(opts.port, function () {
      console.log('proxy-recorder listening on ', opts.port)
      resolve()
    })
  })
}

module.exports = recorder
