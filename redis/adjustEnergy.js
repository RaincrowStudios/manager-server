const scripts = require('../lua/scripts')
const handleDeath = require('../utils/handleDeath')
const informNearbyPlayers = require('../utils/informNearbyPlayers')
const selectRedisClient = require('./selectRedisClient')

module.exports = (entity, energyChange, killer = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!entity.instance || typeof entity.instance !== 'string') {
        throw new Error('Invalid instance: ' + entity.instance)
      }
      else if (typeof energyChange !== 'number' || isNaN(energyChange)) {
        throw new Error('Invalid energy: ' + energyChange)
      }

      const update = []
      const inform = []

      const client = selectRedisClient(entity.instance)

      client.evalsha(
        [scripts.adjustEnergy.sha, 1, entity.instance, energyChange],
        (err, result) => {
          if (err) {
            throw new Error(err)
          }
          else {
            const [newEnergy, newState] = JSON.parse(result)

            inform.push(
              {
                function: informNearbyPlayers,
                parameters: [
                  entity,
                  {
                    command: 'map_energy_change',
                    instance: entity.instance,
                    oldEnergy: entity.energy,
                    oldState: entity.state,
                    newEnergy: newEnergy,
                    newState: newState
                  }
                ]
              }
            )

            if (newState === 'dead') {
              const [interimUpdate, interimInform] = handleDeath(entity, killer)

              update.push(...interimUpdate)
              inform.push(...interimInform)
            }

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
