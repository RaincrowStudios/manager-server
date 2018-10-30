const addFieldToHash = require('../redis/addFieldToHash')
const initializer = require('../initializer/initializer')
const botAdd = require('./bots/botAdd')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const dailiesAdd = require('./dailies/dailiesAdd')
const dukeAdd = require('./dukes/dukeAdd')
const idleTimerAdd = require('./idleTimers/idleTimerAdd')
const immunityAdd = require('./immunities/immunityAdd')
const locationAdd = require('./locations/locationAdd')
const portalAdd = require('./portals/portalAdd')
const spawnPointAdd = require('./spawnPoints/spawnPointAdd')
const spiritAdd = require('./spirits/spiritAdd')
const clearTimers = require('../utils/clearTimers')
const pauseTimers = require('../utils/pauseTimers')

const addTimers = {
  bot: botAdd,
  collectible: collectibleAdd,
  condition: conditionAdd,
  cooldown: cooldownAdd,
  dailies: dailiesAdd,
  duke: dukeAdd,
  idleTimer: idleTimerAdd,
  immunity: immunityAdd,
  location: locationAdd,
  portal: portalAdd,
  spirit: spiritAdd,
  spawnPoint: spawnPointAdd
}

async function manager(message) {
  switch (message.command) {
    case 'initialize':
      initializer(message.instance)
      break
    case 'remove':
      clearTimers(message.instance)
      break
    case 'pause':
      pauseTimers(message.instance)
      break
    case 'add':
      await addFieldToHash(message.instance, 'manager', process.env.INSTANCE_ID)
      await addTimers[message.type](message.instance)
      break
    default:
      break
  }
  return true
}

module.exports = manager
