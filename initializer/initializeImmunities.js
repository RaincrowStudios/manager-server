const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getFieldsFromHash = require('../redis/getFieldsFromHash')
const immunityExpire = require('../manager/immunities/immunityExpire')

async function initializeImmunities() {
  try {
    const immunities = await getActiveSet('immunities')
    if (immunities.length > 0) {
      for (let i = 0; i < immunities.length; i++) {
        if (immunities[i]) {
          const currentTime = Date.now()
          const characterName = await getFieldsFromHash(
            'immunities',
            immunities[i],
            ['bearer']
          )

          const immunity = await getFieldsFromHash(
            'characters',
            characterName,
            ['immunityList']
          ).filter(immunity => immunity.instance === immunities[i])[0]

          if (immunity) {
            if (immunity.expiresOn > currentTime) {
              const expireTimer =
                setTimeout(() =>
                  immunityExpire(immunities[i]),
                  immunity.expiresOn - currentTime
                )

              const previousTimers = timers.by('instance', immunities[i])
              if (previousTimers) {
                previousTimers.expireTimer

                timers.update(previousTimers)
              }
              else {
                timers.insert({
                  instance: immunities[i],
                  expireTimer
                })
              }
            }
            else {
              immunityExpire(immunities[i])
            }
          }
        }
        else {
          deleteCondition(immunities[i])
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializeImmunities
