const timers = require('../../database/timers')
const adjustEnergy = require('../../redis/adjustEnergy')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const informNearbyPlayers = require('../../utils/informNearbyPlayers')
const resolveCondition = require('./components/resolveCondition')
const deleteCondition = require('./deleteCondition')

async function conditionTrigger (conditionInstance) {
  try {
    const currentTime = Date.now()
    const condition = await getAllFromHash(conditionInstance)

    if (!condition || !condition.bearer) {
      deleteCondition(conditionInstance)
      return true
    }
    else {
      const update = []
      const inform = []
      const bearer = await getAllFromHash(condition.bearer)

      if(!bearer){
        deleteCondition(conditionInstance)
        return true
      }

      let caster, spell = ''
      if (condition.caster) {
        [caster, spell] = await Promise.all([
          getAllFromHash(condition.caster),
          getOneFromList('spells', condition.id)
        ])
      }

      const total = resolveCondition(spell.condition.overTime)

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

      const [energyUpdate, energyInform] =
        await adjustEnergy(bearer, total, caster, spell.id)

      update.push(...energyUpdate)
      inform.push(...energyInform)

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
    console.error(err)
  }
}

module.exports = conditionTrigger
