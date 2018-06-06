const timers = require('../database/timers')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const consumableAdd = require('./consumables/consumableAdd')
const conditionDispel = require('./conditions/conditionDispel')
const idleTimerAdd = require('./idleTimers/idleTimerAdd')
const immunityAdd = require('./immunities/immunityAdd')
const locationAdd = require('./locations/locationAdd')
const portalAdd = require('./portals/portalAdd')
const spiritAdd = require('./spirits/spiritAdd')
const spiritDeath = require('./spirits/spiritDeath')

const addTimers = {
  collectible: collectibleAdd,
  condition: conditionAdd,
  consumable: consumableAdd,
  cooldown: cooldownAdd,
  idleTimer: idleTimerAdd,
  immunity: immunityAdd,
  location: locationAdd,
  portal: portalAdd,
  spirit: spiritAdd
}

const deathTimers = {
  spirit: spiritDeath
}

async function manager(message) {
  try {
    let timersToClear
    switch (message.command) {
      case 'dispel':
        conditionDispel(message.target, message.index)
        break
      case 'remove':
        timersToClear = timers.by('instance', message.instance)

        if (timersToClear) {
          for (const key of Object.keys(timersToClear)) {
            if (key !== 'instance') {
              clearTimeout(timersToClear[key])
            }
          }
        }
        break
      case 'add':
        addTimers[message.type](message.instance, message[message.type])
        break
      case 'death':
        deathTimers[message.type](message.instance, message.killer)
        break
      default:
        break
    }
    return true
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = manager
