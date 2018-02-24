const loki = require('lokijs')
const db = new loki()

let timers = db.addCollection('timers', { unique: ['instance'] })

module.exports = timers
