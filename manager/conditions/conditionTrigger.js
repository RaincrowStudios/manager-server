const timers = require('../../database/timers')
const adjustEnergy = require('../../redis/adjustEnergy')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const handleError = require('../../utils/handleError')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const informPlayers = require('../../utils/informPlayers')
const generateDanceCoordinates = require('./components/generateDanceCoordinates')
const resolveCondition = require('./components/resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (conditionInstance) {
  try {
    const currentTime = Date.now()
    const conditionInfo = await getAllFromHash(conditionInstance)

    if (!conditionInfo || !conditionInfo.bearer) {
      deleteCondition(conditionInstance)
      return true
    }
    else {
      const update = []
      const inform = []
      const bearer = await getAllFromHash(conditionInfo.bearer)

      if (!bearer) {
        deleteCondition(conditionInstance)
        return true
      }

      const spell = await getOneFromList('spells', conditionInfo.id)

      const condition = Object.assign(
        {}, spell.condition, conditionInfo
      )

      inform.unshift(
        {
          function: informNearbyPlayers,
          parameters: [
            bearer,
            {
              command: 'map_condition_trigger',
              instance: condition.bearer,
              conditionInstance: conditionInstance
            }
          ]
        }
      )

      if (condition.overTime) {
        const total = resolveCondition(condition.overTime)

        const [energyUpdate, energyInform] =
          await adjustEnergy(bearer, total, condition)

        update.push(...energyUpdate)
        inform.push(...energyInform)
      }
      else if (condition.status === 'magicDance') {
        const [newLatitude, newLongitude] = generateDanceCoordinates(
          bearer.latitude,
          bearer.longitude
        )

        inform.push(
          {
            function: informPlayers,
              parameters: [
              [bearer.player],
              {
                command: 'character_spell_move',
                spell: condition.id,
                latitude: newLatitude,
                longitude: newLongitude
              }
            ]
          }
        )
      }

      condition.triggerOn =
        currentTime + (condition.tick * 1000)

      update.push(
        updateHashField(conditionInstance, 'triggerOn', condition.triggerOn)
      )

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }

      const newTimer =
        setTimeout(() =>
          conditionTrigger(conditionInstance),
          condition.tick * 1000
        )

      let conditionTimer = timers.by('instance', conditionInstance)
      if (conditionTimer) {
        conditionTimer.triggerTimer = newTimer
        timers.update(conditionTimer)
      }
    }

    return true
  }
  catch (err) {
    return handleError(err)
  }
}

module.exports = conditionTrigger
