const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function questReset() {
  try {
    const currenTime = Date.now()
    const dayLater = currenTime + 86400000
    const dayLaterUTC = new Date(dayLater)
    dayLaterUTC.setUTCHours(4)
    dayLaterUTC.setUTCMinutes(0)
    dayLaterUTC.setUTCSeconds(0)
    dayLaterUTC.setUTCMilliseconds(0)

    const newTimer =
      setTimeout(() =>
        questReset(), dayLaterUTC.getTime() - currenTime
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
