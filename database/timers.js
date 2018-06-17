const loki = require('lokijs')
const db = new loki()

const timers = db.addCollection('timers', { unique: ['instance'] })

module.exports = timers
