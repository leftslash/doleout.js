const pathParamRegExp = /^{.*}$/

function Request(request) { 

  this.request = request
  this.method = request.method.toLowerCase()
  this.headers = request.headers
  this.path = request.url.split('?')[0]

}

Request.prototype.cookie = function() {}

Request.prototype.param = function(key) {
  if (this.pathParams === undefined) {
    this.pathParams = {}
    const routeDirs = this.route.path.split('/').slice(1)
    const pathDirs = this.path.split('/').slice(1)
    for (var i in routeDirs) {
      if (pathParamRegExp.test(routeDirs[i])) {
        var dir = routeDirs[i].slice(1,routeDirs[i].length-1)
        this.pathParams[dir] = pathDirs[i]
      }
    }
  }
  return this.pathParams[key]
}

Request.prototype.query = function(key) {
  if (this.queryParams === undefined) {
    this.queryParams = {}
    const queries = this.request.url.split('?').slice(1)
    for (var i in queries) {
      var query = queries[i]
      var keyValues = query.split('&')
      for (var j in keyValues) {
        var keyValue = keyValues[j].split('=')
        this.queryParams[keyValue[0]] = keyValue[1]
      }
    }
  }
  return this.queryParams[key]
}
        
Request.prototype.json = function() {}
Request.prototype.form = function() {}

module.exports = Request
