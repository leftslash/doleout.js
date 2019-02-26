function Response(response) { 
  this.response = response
}

Response.prototype.type = function() {}
Response.prototype.cookie = function() {}
Response.prototype.write = function() {}
Response.prototype.header = function() {}
Response.prototype.err = function() {}

module.exports = Response
