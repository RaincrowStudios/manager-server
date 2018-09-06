const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const incrementHashField = require('../../redis/incrementHashField')
const updateHashFieldObject = require('../../redis/updateHashFieldObject')
const handleError = require('../../utils/handleError')
const handleLocationLose = require('../../utils/handleLocationLose')
const informPlayers = require('../../utils/informPlayers')
const spiritExpire = require('../spirits/spiritExpire')

module.exports = async (locationInstance) => {
  try {
    const currentTime = Date.now()
    const location = await getAllFromHash(locationInstance)

    if (location && location.controlledBy) {
      const update = []
      const inform = []

      if (Object.keys(location.spirits).length) {
        for (const spiritInstance of Object.keys(location.spirits)) {
          update.push(
            spiritExpire(spiritInstance),
            updateHashFieldObject(
              locationInstance,
              'remove',
              'spirits',
              spiritInstance
            )
          )
        }
      }

      const reward = await getOneFromList('constants', 'locationReward')
      if (reward) {
        const members = await getOneFromHash(location.controlledBy, 'members')

        const playersToInform = members ?
          members.map(member => member.player) :
          [await getOneFromHash(location.controlledBy, 'player')]

        if (members) {
          for (const member of members) {
            update.push(
              incrementHashField(member.character, 'gold', reward)
            )
          }
        }
        else {
          update.push(
            incrementHashField(location.controlledBy, 'gold', reward)
          )
        }

        inform.push(
          informPlayers(
            playersToInform,
            {
              command: 'player_location_reward',
              reward: reward
            }
          )
        )
      }

      const [controlUpdate, controlInform] = await handleLocationLose(location)
      update.push(...controlUpdate)
      inform.push(...controlInform)

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }
    }

    location.rewardOn = currentTime + (86400000 * 9)

    const newTimer = currentTime + (86400000 * 9)

    const locationTimers = timers.by('instance', locationInstance)
    if (locationTimers) {
      locationTimers.rewardTimer = newTimer
      timers.update(locationTimers)
    }

    return true
  }
  catch (err) {
    return handleError(err)
  }
}
