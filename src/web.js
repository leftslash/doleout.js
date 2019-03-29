const fs       = require('fs')
const http     = require('http')
const https    = require('https')
const http2    = require('http2')
const pathUtil = require('path')
const Router   = require('./router')
const Request  = require('./request')
const Response = require('./response')

// TODO: fix 404 on bad static file 
// TODO: cookies
// TODO: security stuff
// TODO: jwt auth
// TODO: user/group auth
// TODO: webdav
// TODO: git
// TODO: php
// TODO: proxy
// TODO: rewrite
// TODO: routes defined in yaml

const defaultHost      =  'localhost'
const defaultLog       =  process.stderr
const defaultDir       =  __dirname
const defaultHttpPort  =  8080
const defaultHttpsPort =  8443
const defaultHttp2Port =  8880
const defaultSslCA     =  pathUtil.join(__dirname, 'ssl/ca.crt')
const defaultSslCrt    =  pathUtil.join(__dirname, 'ssl/https.crt')
const defaultSslKey    =  pathUtil.join(__dirname, 'ssl/https.key')
const defaultDisabled  =  false

const protocols = [ 'http', 'https', 'http2' ]

function isIn(item, array) {
  return array.includes(item)
}

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

function ProtocolServer(proto) {

  switch (proto) {
    case 'http':
      this.port = defaultHttpPort
      break
    case 'https':
      this.port = defaultHttpsPort
      this.ca   = defaultSslCA
      this.crt  = defaultSslCrt
      this.key  = defaultSslKey
      break
    case 'http2':
      this.port = defaultHttp2Port
      this.ca   = defaultSslCA
      this.crt  = defaultSslCrt
      this.key  = defaultSslKey
      break
    default:
      return
  }

  this.proto   = proto 
  this.host    = defaultHost
  this.dir     = defaultDir
  this.logFile = defaultLog
  this.disable = defaultDisabled

  this.router = new Router
  this.router.proto = this
}

ProtocolServer.prototype.configure = function(config) {
  for (let key in config) {
    this[key] = config[key]
  }
  if (typeof this.logFile === 'string') {
    this.logFile = fs.createWriteStream(this.logFile)
  }
}

ProtocolServer.prototype.log = function(message) {
  this.logFile.write(timestamp() + ': ' + message + '\n')
}

ProtocolServer.prototype.registerStatic = function(path, directory) {
  this.router.addStatic(path, directory)
}

ProtocolServer.prototype.register = function(method, path, handler) {
  this.router.add(method, path, handler)
}

ProtocolServer.prototype.registerGet = function(path, handler) {
  this.register('get', path, handler)
}

ProtocolServer.prototype.registerPut = function(path, handler) {
  this.register('put', path, handler)
}

ProtocolServer.prototype.registerPost = function(path, handler) {
  this.register('post', path, handler)
}

ProtocolServer.prototype.registerDelete = function(path, handler) {
  this.register('delete', path, handler)
}

ProtocolServer.prototype.run = function() {

  let server = undefined

  const sslOptions = () => {
    return {
      ca:   fs.readFileSync(this.ca),
      cert: fs.readFileSync(this.crt),
      key:  fs.readFileSync(this.key)
    }
  }

  const handler = (request, response) => {

    // create new objects to wrap native node stuff
    const req = new Request(request)
    const res = new Response(response)

    // log this incoming request
    this.log(`${this.proto}://${this.host}:${this.port}${req.request.url}`)

    // find the route that matches this request
    // and return an error if there's no matching route
    const route = this.router.find(req)
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
  }

  const streamHandler = (stream) => {
    handler(stream, stream)
  }

  switch (this.proto) {
    case 'http':
      server = new http.Server()
      server.on('request', handler)
      break
    case 'https':
      server = https.createServer(sslOptions())
      server.on('request', handler)
      break
    case 'http2':
      server = http2.createServer(sslOptions())
      server.on('stream', streamHandler)
      break
    default:
      return
  }

  // Initial log entry
  this.log(`${this.proto}://${this.host}:${this.port} started`)

  // Actually start the servers
  server.listen(this.port, this.host)

}

function WebServer() {
  this.proto = {}
  for (let p of protocols) {
    this.proto[p] = new ProtocolServer(p)
    this[p] = this.proto[p] // convenience for clients
  }
}

WebServer.prototype.forEachProtoServer = function(callback) {
  for (let proto in this.proto) {
    callback(this.proto[proto])
  }
}

WebServer.prototype.configure = function(config) {
  this.forEachProtoServer(function(proto) {
    proto.configure(config[proto.proto])
  })
}

WebServer.prototype.registerStatic = function(path, directory) {
  this.forEachProtoServer(function(proto) {
    proto.registerStatic(path, directory)
  })
}

WebServer.prototype.register = function(method, path, handler) {
  this.forEachProtoServer(function(proto) {
    proto.register(method, path, handler)
  })
}

WebServer.prototype.registerGet = function(path, handler) {
  this.register('get', path, handler)
}

WebServer.prototype.registerPut = function(path, handler) {
  this.register('put', path, handler)
}

WebServer.prototype.registerPost = function(path, handler) {
  this.register('post', path, handler)
}

WebServer.prototype.registerDelete = function(path, handler) {
  this.register('delete', path, handler)
}

WebServer.prototype.run = function() {
  this.forEachProtoServer(function(proto) {
    proto.disabled || proto.run()
  })
}

module.exports = new WebServer
