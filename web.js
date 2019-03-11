const fs = require('fs')
const http = require('http')

const router = require('./router')
const request = require('./request')
const response = require('./response')

// TODO: static w/mime
// TODO: logging
// TODO: cookies
// TODO: security stuff
// TODO: jwt auth
// TODO: user/group auth
// TODO: http/s/2
// TODO: move shit to util class
// TODO: webdav
// TODO: git
// TODO: php
// TODO: proxy
// TODO: rewrite
// TODO: routes defined in yaml

function zeropad(num) {
  return num > 9 ? '' + num : '0' + num
}

function timestamp() {
  var date = new Date()
  var y = date.getFullYear()
  var m = zeropad(date.getMonth() + 1)
  var d = zeropad(date.getDate())
  var H = zeropad(date.getHours())
  var M = zeropad(date.getMinutes())
  var S = zeropad(date.getSeconds())
  return `${y}-${m}-${d} ${H}:${M}:${S}`
}

function WebServer() {}

WebServer.prototype.configure = function(config) {
  this.config = config || {}
  this.config.host = this.config.host || '127.0.0.1'
  this.config.port = this.config.port || 8080
  this.config.log = this.config.log || process.stderr
  this.config.dir = this.config.dir || __dirname
  if (typeof this.config.log === 'string') {
    this.config.log = fs.createWriteStream(this.config.log)
  }
}

WebServer.prototype.registerStatic = function(path, directory) {
  router.addStatic(path, directory)
}

WebServer.prototype.registerGet = function(path, handler) {
  router.add('get', path, handler)
}

WebServer.prototype.registerPut = function(path, handler) {
  router.add('put', path, handler)
}

WebServer.prototype.registerPost = function(path, handler) {
  router.add('post', path, handler)
}

WebServer.prototype.registerDelete = function(path, handler) {
  router.add('delete', path, handler)
}

WebServer.prototype.log = function(message) {
  this.config.log.write(timestamp() + ': ' + message + '\n')
}

WebServer.prototype.run = function() {
  if (!this.config) this.configure()

  const server = new http.Server()

  server.on('request', (_request, _response) => {
    const req = new request(_request)
    const res = new response(_response)
    this.log(`${req.path}`)
    const route = router.find(req)
    if (!route) {
      res.err(404)
      return
    }
    if (!route.handler && route.directory) {
      serveStatic(route)
      return 
    }
    route.handler(req, res)
  })

  this.log(`started, listening on ${this.config.host}:${this.config.port}`)

  server.listen(this.config.port, this.config.host)

}

module.exports = new WebServer

// This is just development/test hackery, delete later

function handler(req, res) {
  // req.form('x', (value) => {
  //   res.write(`${value}\n`)
  //   res.end()
  // })
  req.json((body) => {
    res.write(`${JSON.stringify(body, null, 2)}\n`)
    res.end()
  })
}

w = new WebServer
w.configure({ port: 1234 })
w.registerStatic('/public', 'static')
w.registerPost('/item/{id}/other/{x}', handler)
w.run()
