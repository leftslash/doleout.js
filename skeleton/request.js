const url = require('url')

function Request(request) { 
  this.request = request
  this.method = request.method
  this.headers = request.headers
  this.url = url.parse(request.url)
  console.log(JSON.stringify(this.url))
}

Request.prototype.cookie = function() {}
Request.prototype.param = function() {}
Request.prototype.query = function() {}
Request.prototype.bodyJson = function() {}
Request.prototype.formValue = function() {}

module.exports = Request
