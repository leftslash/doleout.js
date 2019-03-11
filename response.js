function Response(response) { 
  this.response = response
}

Response.prototype.write = function(data) {
  return this.response.write(data)
}

Response.prototype.end = function(data) {
  return this.response.end(data)
}

Response.prototype.err = function() {
  this.response.write('404\n')
  this.response.end()
}

Response.prototype.type = function() {}
Response.prototype.cookie = function() {}
Response.prototype.header = function() {}

module.exports = Response
