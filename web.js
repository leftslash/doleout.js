const fs   = require('fs')
const http = require('http')

const router   = require('./router')
const Request  = require('./request')
const Response = require('./response')

// TODO: add include to template render
// TODO: logging
// TODO: cookies
// TODO: http/s/2
// TODO: security stuff
// TODO: jwt auth
// TODO: user/group auth
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

function WebServer() {
  this.config      = {}
  this.config.host = '127.0.0.1'
  this.config.port =  8080
  this.config.log  =  process.stderr
  this.config.dir  =  __dirname

  router.config = this.config
}

WebServer.prototype.configure = function(config) {
  this.config.host = config.host || this.config.host
  this.config.port = config.port || this.config.port
  this.config.log  = config.log  || this.config.log
  this.config.dir  = config.dir  || this.config.dir
  if (typeof this.config.log === 'string') {
    this.config.log = fs.createWriteStream(this.config.log)
  }
  router.config = this.config
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

  // Create a new server
  const server = new http.Server()

  // Setup callback to handle incoming requests
  server.on('request', (_request, _response) => {

    // create new objects to wrap native node stuff
    const req = new Request(_request)
    const res = new Response(_response)

    // log this incoming request
    this.log(`${req.path}`)

    // find the route that matches this request
    // and return an error if there's no matching route
    const route = router.find(req)
    if (!route) {
      res.err(404)
      return
    }

    // if we have a route, but no handler, but a directory
    // then treat this as a request for static content
    if (!route.handler && route.directory) {
      res.static(req, route)
      return 
    }

    // otherwise, pass off request to handler defined in route
    route.handler(req, res)
  })

  // Initial log entry
  this.log(`started, listening on ${this.config.host}:${this.config.port}`)

  // Actually start the server
  server.listen(this.config.port, this.config.host)

}

module.exports = new WebServer

// This is just development/test hackery, delete later

function handler(req, res) {
  // req.form('x', (value) => {
  //   res.write(`${value}\n`)
  //   res.end()
  // })
  // req.json((body) => {
  //   res.write(`${JSON.stringify(body, null, 2)}\n`)
  //   res.end()
  // })
  let data = { title: 'Hello, Todd!', list: {a:1, b:2, c:3} }
  res.render('template.html', data)
}

s = new WebServer
s.configure({ port: 1234 })
s.registerStatic('/public', 'static')
s.registerPost('/item/{id}/other/{x}', handler)
s.run()
