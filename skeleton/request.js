function Request(request) { 
  this.request = request
  this.method = request.method
  this.headers = request.headers
  this.url = request.url
  console.log(this)
}

Request.prototype.cookie = function() {}
Request.prototype.param = function() {}
Request.prototype.query = function() {}
Request.prototype.bodyJson = function() {}
Request.prototype.formValue = function() {}

module.exports = Request
