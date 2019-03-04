function Response(response) { 
  this.response = response
}

Response.prototype.type = function() {}
Response.prototype.cookie = function() {}
Response.prototype.write = function() {}
Response.prototype.header = function() {}
Response.prototype.err = function() {
  this.response.write('404\n')
  this.response.end()
}

module.exports = Response
