const fs       = require('fs')
const http     = require('http')
const https    = require('https')
const http2    = require('http2')
const pathUtil = require('path')

// TODO: Bail on Symbols for Strings, nice idea but not ready for primetime

const router   = require('./router')
const Request  = require('./request')
const Response = require('./response')

const protocols = [ 'http', 'https', 'http2' ]

const defaultSslCA   =  pathUtil.join(__dirname, 'ssl/ca.crt')
const defaultSslCrt  =  pathUtil.join(__dirname, 'ssl/https.crt')
const defaultSslKey  =  pathUtil.join(__dirname, 'ssl/https.key')

// TODO: fix 404 on bad static file 
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
  this.proto = {}
  this.config = {}
  for (let p of protocols) {
    this.proto[p] = new ProtocolServer(p)
    this.config[p] = this.proto[p].config
  }
}

function ProtocolServer(proto) {
  this.config = {}
  switch (proto) {
    case 'http':
      this.config.port =  8080
      break;
    case 'https':
      this.config.port =  8443
      this.config.ca   =  defaultSslCA
      this.config.crt  =  defaultSslCrt
      this.config.key  =  defaultSslKey
      break;
    case 'http2':
      this.config.port =  8880
      this.config.ca   =  defaultSslCA
      this.config.crt  =  defaultSslCrt
      this.config.key  =  defaultSslKey
      break;
    default:
      this.config = undefined
      return
  }
  this.config.enable = true
  this.config.host   = 'localhost'
  this.config.dir    = __dirname
  this.config.log    =  process.stderr
  router.config = router.config || {}
  router.config.proto = this.config
}

WebServer.prototype.configure = function(config) {
  for (let p of protocols) {
    this.config[p] = {...this.config[p], ...config.protocols[p]}
    if (typeof this.config[p].log === 'string') {
      this.config[p].log = fs.createWriteStream(this.config[p].log)
    }
    router.config[p] = this.config[p]
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
  this.config.http.log.write(timestamp() + ': ' + message + '\n')
}

WebServer.prototype.run = function() {

  const sslOptions = {
    ca:   fs.readFileSync(this.config.https.ca),
    cert: fs.readFileSync(this.config.https.crt),
    key:  fs.readFileSync(this.config.https.key)
  }

  // Create new HTTP/S/2 servers
  const httpServer = new http.Server()
  const httpsServer = new https.createServer(sslOptions)

  // Setup callback to handle incoming requests
  httpServer.on('request', (_request, _response) => {

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

  // Setup callback to handle incoming requests
  httpsServer.on('request', (_request, _response) => {
    _response.end('Hello, World!')
  })

  // Initial log entry
  this.log(`http started, listening on ${this.config.http.host}:${this.config.http.port}`)
  this.log(`https started, listening on ${this.config.https.host}:${this.config.https.port}`)

  // Actually start the servers
  httpServer.listen(this.config.http.port, this.config.http.host)
  httpsServer.listen(this.config.https.port, this.config.https.host)

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
s.config.HTTPS.host = 'www.local'
s.registerStatic('/public', 'static')
s.registerPost('/item/{id}/other/{x}', handler)
s.run()
