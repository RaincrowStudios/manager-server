const timers = require('../../database/timers')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromList = require('../../redis/getOneFromList')
const updateHashField = require('../../redis/updateHashField')
const removeFromAll = require('../../redis/removeFromAll')
const resolveSpiritMove = require('./move/resolveSpiritMove')

async function spiritMove(spiritInstance) {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      if (!instanceInfo.id) {
        await removeFromAll('spirits', spiritInstance)
        return true
      }
      const update = []
      const inform = []

      const spiritInfo = await getOneFromList('spirits', instanceInfo.id)

      let spirit = Object.assign({}, spiritInfo, instanceInfo)

      if(!spirit.owner) {
        spirit = {...spirit, ...spirit.wild}
      }

      if (
        !Object.values(spirit.conditions)
          .filter(condition => condition.status === 'bound').length
      ) {

        const [interimUpdate, interimInform] = await resolveSpiritMove(spirit)

        update.push(...interimUpdate)
        inform.push(...interimInform)
      }

      const currentTime = Date.now()

      let newMoveOn
      if (spirit.moveFreq.includes('-')) {
        const range = spirit.moveFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        newMoveOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        newMoveOn = parseInt(spirit.moveFreq, 10)
      }

      update.push(updateHashField(spirit.instance, 'moveOn', newMoveOn))

      await Promise.all(update)

      for (const informObject of inform) {
        const informFunction = informObject.function
        await informFunction(...informObject.parameters)
      }

      const newTimer =
        setTimeout(() =>
          spiritMove(spirit.instance), newMoveOn - currentTime
        )

      const spiritTimers = timers.by('instance', spirit.instance)
      if (spiritTimers) {
        spiritTimers.moveTimer = newTimer
        timers.update(spiritTimers)
      }
    }
    return true
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritMove
