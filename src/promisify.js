const promisify = original => {
  return function() {
    let args = [...arguments]
    return new Promise(function(resolve, reject) {
      original(...args, function(err, val) {
        if (err) {
          reject(err)
        } else {
          resolve(val)
        }
      })
    })
  }
}

module.exports = promisify
