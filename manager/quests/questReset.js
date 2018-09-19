const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function questReset() {
  try {
    const newTimer =
      setTimeout(() =>
        questReset(), 86400000
      )

    let questTimers = timers.by('instance', 'quests')
    if (questTimers) {
      questTimers.resetTimer = newTimer
      timers.update(questTimers)
    }

    return informGame(
      'quest',
      'covens',
      'head',
      'covens/quest/reset'
    )
  }
  catch (err) {
    return handleError(err)
  }
}

module.exports = questReset
