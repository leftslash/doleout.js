const fs = require('fs')
const pathUtil = require('path')

const mime = require('./mime')
const Template = require('./template')

function Response(response) { 
  this.response = response
}

Response.prototype.write = function(data) {
  return this.response.write(data)
}

Response.prototype.end = function(data) {
  return this.response.end(data)
}

Response.prototype.static = function(req, route) {
  // get extension from req
  let ext = pathUtil.extname(req.path).slice(1)
  // lookup & set mimetype header
  let mimeType = mime[ext] || 'application/octet-stream'
  // build filename from req and route, an example:
  // req.path:        /public/path/to/file.ext
  // route.regexp:    /public/path
  // route.directory: /dist/static
  // result:          /dist/static/to/file.ext
  // remove regexp from path, append to directory
  let fileName = pathUtil.join(route.directory, req.path.replace(route.regexp, ''))
  file = fs.createReadStream(fileName)
  file.on('error', () => {
    this.err(404)
    return
  })
  this.response.setHeader('Content-Type', mimeType)
  this.response.writeHead(200)
  file.pipe(this.response)  
}  

Response.prototype.render = function(fileName, data) {
  let text
  try {
    text = String(fs.readFileSync(fileName))
  } catch(e) {
    this.err(404)
    return
  }
  template = new Template(text)
  this.response.setHeader('Content-Type', 'text/html')
  this.response.writeHead(200)
  this.response.write(template.render(data))
  this.response.end()
}

Response.prototype.err = function(err) {
  this.response.write(`${err}\n`)
  this.response.end()
}

Response.prototype.cookie = function() {}
Response.prototype.header = function() {}

module.exports = Response