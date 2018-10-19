const timers = require('../../database/timers')
const handleError = require('../../utils/handleError')
const informGame = require('../../utils/informGame')

async function dailyReset() {
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
        dailyReset(), dayLaterUTC.getTime() - currenTime
      )

    let dailyTimers = timers.by('instance', 'dailies')
    if (dailyTimers) {
      dailyTimers.resetTimer = newTimer
      timers.update(dailyTimers)
    }

    return informGame(
      'daily',
      'covens',
      'head',
      'covens/daily/reset'
    )
  }
  catch (err) {
    return handleError(err)
  }
}

module.exports = dailyReset
