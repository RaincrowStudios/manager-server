const getManagedInstancesList = require('../utils/getManagedInstancesList')
const handleError = require('../utils/handleError')
const initializeBots = require('./initializeBots')
const initializeConditions = require('./initializeConditions')
const initializeCooldowns = require('./initializeCooldowns')
const initializeDailies = require('./initializeDailies')
const initializeImmunities = require('./initializeImmunities')
const initializeIdleTimers = require('./initializeIdleTimers')
const initializeLocations = require('./initializeLocations')
const initializePortals = require('./initializePortals')
const initializeSpawnPoints = require('./initializeSpawnPoints')
const initializeSpirits = require('./initializeSpirits')

async function initializer() {
  try {
    const id = process.env.INSTANCE_ID

    let managers = []
    if (process.env.NODE_ENV !== 'development') {
      managers = await getManagedInstancesList()
    }

    await Promise.all([
      initializeBots(id, managers),
      initializeConditions(id, managers),
      initializeCooldowns(id, managers),
      initializeDailies(id, managers),
      initializeIdleTimers(id, managers),
      initializeImmunities(id, managers),
      initializeLocations(id, managers),
      initializePortals(id, managers),
      initializeSpawnPoints(id, managers),
      initializeSpirits(id, managers)
    ])
  }
  catch (err) {
    handleError(err)
  }
}

module.exports = initializer
