// Credit to: https://github.com/jasonmoo/t.js

const blockRegExp = /\{\{(([@!]?)(.+?))\}\}(([\s\S]+?)(\{\{:\1\}\}([\s\S]+?))?)\{\{\/\1\}\}/g
const valRegExp   = /\{\{([=%])(.+?)\}\}/g

function scrub(val) {
  return new Option(val).innerHTML.replace(/"/g, '&quot')
}

function get_value(data, key) {
  var parts = key.split('.')
  while (parts.length) {
    if (!(parts[0] in data)) {
      return false
    }
    data = data[parts.shift()]
  }
  return data
}

function render(text, data) {
  return text
    .replace(blockRegExp, function(_, __, meta, key, inner, if_true, has_else, if_false) {

      var val = get_value(data, key)
      let temp = ''
      let i

      if (!val) {
        // handle if not
        if (meta == '!') return render(inner, data)
        // check for else
        if (has_else) return render(if_false, data)
        return ''
      }

      // regular if
      if (!meta) return render(if_true, data)

      // process array/obj iteration
      if (meta == '@') {
        // store any previous data
        // reuse existing data
        _ = data._key
        __ = data._val
        for (i in val) {
          if (val.hasOwnProperty(i)) {
            data._key = i
            data._val = val[i]
            temp += render(inner, data)
          }
        }
        data._key = _
        data._val = __
        return temp
      }

    })
    .replace(valRegExp, function(_, meta, key) {
      var val = get_value(data,key)

      if (val || val === 0) {
        return meta == '%' ? scrub(val) : val
      }
      return ''
    })
}

function Template(text) {
  this.text = text
}

Template.prototype.render = function(data) {
  return render(this.text, data)
}

module.exports = Template

// let text = `<h1>{{=title}}</h1>\n<div>\n  <ul>\n{{@list}}    <li>{{=_key}}:{{=_val}}</li>\n{{/@list}}\n  </ul>\n</div>`
// let data = { title: 'Hello, World!', list: {a:1, b:2, c:3} }
// let template = new Template(text)
// console.log(template.render(data))