const timers = require('../database/timers')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const immunityAdd = require('./immunities/immunityAdd')
const portalAdd = require('./portals/portalAdd')
const riftAdd = require('./rifts/riftAdd')
const spiritAdd = require('./spirits/spiritAdd')
const spiritDeath = require('./spirits/spiritDeath')

const addTimers = {
  collectible: collectibleAdd,
  condition: conditionAdd,
  cooldown: cooldownAdd,
  immunity: immunityAdd,
  portal: portalAdd,
  rift: riftAdd,
  spirit: spiritAdd
}

const deathTimers = {
  spirit: spiritDeath
}

async function manager(message) {
  try {
    let timersToClear
    switch (message.command) {
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
