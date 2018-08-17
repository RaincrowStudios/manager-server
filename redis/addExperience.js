const scripts = require('../lua/scripts')
const adjustLeaderboards = require('../utils/adjustLeaderboards')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const informPlayers = require('../utils/informPlayers')
const getOneFromList = require('./getOneFromList')
const incrementHashField = require('./incrementHashField')
const selectRedisClient = require('./selectRedisClient')

module.exports = (entity, xpGain) => {
  return new Promise((resolve, reject) => {
    try {
      if (!entity.instance || typeof entity.instance !== 'string') {
        throw new Error('Invalid instance: ' + entity.instance)
      }
      else if (typeof xpGain !== 'number' || isNaN(xpGain)) {
        throw new Error('Invalid xp: ' + xpGain)
      }
      else if (entity.coven) {
        if (typeof coven !== 'string') {
          throw new Error('Invalid coven: ' + entity.coven)
        }
      }

      const update = []
      const inform = []

      const client = selectRedisClient(entity.instance)

      client.evalsha(
        [scripts.addExperience.sha, 1, entity.instance, xpGain],
        async (err, results) => {
          if (err) {
            throw new Error(err)
          }
          else {
            const [newXp, newLevel] = JSON.parse(results)

            if (newLevel) {
              const baseEnergyByLevel =
                await getOneFromList('constants', 'baseEnergyByLevel')

              update.push(
                incrementHashField(entity.instance, 'silver', 100),
                incrementHashField(entity.instance, 'unspentPoints', 1)
              )

              inform.push(
                {
                  function: informNearbyPlayers,
                  parameters: [
                    entity,
                    {
                      command: 'map_level_up',
                      instance: entity.instance,
                      newLevel: newLevel,
                      newBaseEnergy: baseEnergyByLevel[newLevel - 1],
                    }
                  ]
                }
              )
            }

            const interimUpdate = adjustLeaderboards(entity, xpGain)

            update.push(...interimUpdate)

            resolve([update, inform])
          }
        }
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
