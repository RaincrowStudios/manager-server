const initializeConditions = require('./initializeConditions')
//const initializePortals = require('./initializePortals')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  initializeConditions()
  //initializePortals()
  initializeSpirits()
}

module.exports = initializer
