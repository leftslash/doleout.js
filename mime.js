const db = require('mime-db')

const mime = {}

for (let mimeType in db) {
  for (let extIndex in db[mimeType].extensions) {
    let ext = db[mimeType].extensions[extIndex]
    if (mime[ext]) {
      // Duplicate extension to mime-type mappings, ignore for now
      // console.log(`duplicate: ${ext} already mapped to ${mime[ext]}, cannot re-map to ${mimeType}`)
    } else {
      mime[ext] = mimeType
    }
  }
}

for (let ext in mime) {
  console.log(`${ext}\t${mime[ext]}`)
}

module.exports = mime
