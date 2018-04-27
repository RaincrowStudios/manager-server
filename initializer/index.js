const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeImmunities = require('./initializeImmunities')
//const initializePortals = require('./initializePortals')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  initializeConditions()
  initializeCooldowns()
  initializeImmunities()
  //initializePortals()
  initializeSpirits()
}

module.exports = initializer
