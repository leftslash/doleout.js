function O(n) {
  var _n = n
  function _f() {
    return _n
  }
  this.get = function() {
    return _f()
  }
}

o = new O(1)
o2 = new o.constructor(2)
console.log(o.get())
console.log(o2.get())
