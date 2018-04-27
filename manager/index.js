const timers = require('../database/timers')
const collectibleAdd = require('./collectibles/collectibleAdd')
const cooldownAdd = require('./cooldowns/cooldownAdd')
const conditionAdd = require('./conditions/conditionAdd')
const immunityAdd = require('./immunities/immunityAdd')
const portalAdd = require('./portals/portalAdd')
const riftAdd = require('./rifts/riftAdd')

const addTimers = {
  collectible: collectibleAdd,
  condition: conditionAdd,
  cooldown: cooldownAdd,
  immunity: immunityAdd,
  portal: portalAdd,
  rift: riftAdd,
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
      default:
        break
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = manager
