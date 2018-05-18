const timers = require('../database/timers')
const getActiveSet = require('../redis/getActiveSet')
const getOneFromHash = require('../redis/getOneFromHash')
const immunityExpire = require('../manager/immunities/immunityExpire')

async function initializeImmunities() {
  return new Promise(async (resolve, reject) => {
    try {
      const immunities = await getActiveSet('immunities')

      if (immunities.length) {
        for (let i = 0; i < immunities.length; i++) {
          if (immunities[i]) {
            const currentTime = Date.now()
            const immunity = await getOneFromHash('list:immunities', immunities[i])

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
                  timers.insert({instance: immunities[i], expireTimer})
                }
              }
              else {
                immunityExpire(immunities[i])
              }
            }
          }
        }
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = initializeImmunities
