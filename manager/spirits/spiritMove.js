const timers = require('../../database/timers')
const addFieldsToHash = require('../../redis/addFieldsToHash')
const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const resolveSpiritMove = require('./move/resolveSpiritMove')

async function spiritMove(spiritInstance) {
  try {
    const instanceInfo = await getAllFromHash(spiritInstance)

    if (instanceInfo) {
      const spiritInfo = await getOneFromHash('list:spirits', instanceInfo.id)

      const spirit = Object.assign(
        {}, spiritInfo, instanceInfo, {instance: spiritInstance}
      )

      if (
        !spirit.conditions.map(condition => condition.status).includes('bound')
      ) {
        await resolveSpiritMove(spirit)
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

      await addFieldsToHash(spirit.instance, ['moveOn'], [newMoveOn])

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
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = spiritMove
