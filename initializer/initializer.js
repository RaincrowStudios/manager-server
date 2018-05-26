const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeImmunities = require('./initializeImmunities')
const initializePortals = require('./initializePortals')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  try {
    console.log(`${process.pid} initializing timers`)
    await Promise.all([
      initializeConditions(),
      initializeCooldowns(),
      initializeImmunities(),
      initializePortals(),
      initializeSpirits()
    ])
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializer
