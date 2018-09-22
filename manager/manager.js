const addFieldToHash = require('../redis/addFieldToHash')
const botAdd = require('./bots/botAdd')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const dukeAdd = require('./dukes/dukeAdd')
const idleTimerAdd = require('./idleTimers/idleTimerAdd')
const immunityAdd = require('./immunities/immunityAdd')
const locationAdd = require('./locations/locationAdd')
const portalAdd = require('./portals/portalAdd')
const spiritAdd = require('./spirits/spiritAdd')
const clearTimers = require('../utils/clearTimers')

const addTimers = {
  bot: botAdd,
  collectible: collectibleAdd,
  condition: conditionAdd,
  cooldown: cooldownAdd,
  duke: dukeAdd,
  idleTimer: idleTimerAdd,
  immunity: immunityAdd,
  location: locationAdd,
  portal: portalAdd,
  spirit: spiritAdd
}

async function manager(message) {
  switch (message.command) {
    case 'remove':
      clearTimers(message.instance)
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
