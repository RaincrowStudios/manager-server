const timers = require('../../database/timers')
const addFieldsToHash = require('../../redis/addFieldsToHash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const resolveSpiritMove = require('./move/resolveSpiritMove')

async function spiritMove(spiritInstance) {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      const spititInfo = await getOneFromHash('list:spirits', instanceInfo.id)
      const spirit = Object.assign({}, spititInfo, instanceInfo)

      const currentTime = Date.now()
      const range = spirit.moveFreq.split('-')
      const min = parseInt(range[0], 10)
      const max = parseInt(range[1], 10)

      const newMoveOn = currentTime +
        (Math.floor(Math.random() * (max - min + 1)) + min) * 1000

      const boundCheck =
        spirit.conditions.filter(condition => condition.status === 'bound')

      if (boundCheck.length <= 0) {
        await resolveSpiritMove(spiritInstance, spirit)
      }

      const newTimer =
        setTimeout(() =>
          spiritMove(spiritInstance), newMoveOn - currentTime
        )

      await addFieldsToHash(spiritInstance, ['moveOn'], [newMoveOn])

      let spiritTimers = timers.by('instance', spiritInstance)
      if (spiritTimers) {
        spiritTimers.moveTimer = newTimer
        timers.update(spiritTimers)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritMove
