const fs = require('fs')
const http = require('http')
const router = require('./router')
const request = require('./request')
const response = require('./response')

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

function log(message) {
  this.config.log.write(timestamp() + ': ' + message + '\n')
}

function Web() {}

Web.prototype.configure = function(config) {
  this.config = config || {}
  this.config.host = this.config.host || '127.0.0.1'
  this.config.port = this.config.port || 8080
  this.config.log = this.config.log || process.stderr
  if (typeof this.config.log === 'string') {
    this.config.log = fs.createWriteStream(this.config.log)
  }
}

Web.prototype.registerGet = function(path, handler) {
  router.add('get', path, handler)
}

Web.prototype.registerPut = function(path, handler) {
  router.add('put', path, handler)
}

Web.prototype.registerPost = function(path, handler) {
  router.add('post', path, handler)
}

Web.prototype.registerDelete = function(path, handler) {
  router.add('delete', path, handler)
}

Web.prototype.registerStatic = function(path) {
  router.add('static', path, null)
}

Web.prototype.run = function() {
  if (!this.config) this.configure()

  const server = new http.Server()

  server.on('request', (_request, _response) => {
    const req = new request(_request)
    const res = new response(_response)
    _response.write('Hello, World!\n')
    _response.end()
  })

  log.call(this, `started, listening on ${this.config.host}:${this.config.port}`)

  server.listen(this.config.port, this.config.host)

}

module.exports = new Web()

w = new Web()
w.configure({port:1234})
w.run()
