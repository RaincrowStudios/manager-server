const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const questCreate = require('./questCreate')

async function questReset() {
  try {
    const currentTime = Date.now()

    const newQuests = await questCreate()

    const newTimer =
      setTimeout(() =>
        questReset(), newQuests.expiresOn - currentTime
      )

    let questTimers = timers.by('instance', 'quests')
    if (questTimers) {
      questTimers.resetTimer = newTimer
      timers.update(questTimers)
    }

    return true
  }
  catch (err) {
    handleError(err)
  }
}

module.exports = questReset
