const timers = require('../database/timers')
const addEntriesToList = require('../redis/addEntriesToList')
const getEntriesFromList = require('../redis/getEntriesFromList')
const questReset = require('../manager/quests/questReset')

module.exports = async (id, managers) => {
  const [manager, expiresOn] = await getEntriesFromList(
    'quests',
    ['manager', 'expiresOn']
  )

  if (!managers.includes(manager)) {
    await addEntriesToList('quests', ['manager'], [id])

    const currentTime = Date.now()

    const resetTimer =
      setTimeout(() =>
        questReset(),
        expiresOn > currentTime ?
          expiresOn - currentTime : 0
      )

    const previousTimers = timers.by('instance', 'quests')
    if (previousTimers) {
      previousTimers.resetTimer = resetTimer
      timers.update(previousTimers)
    }
    else {
      timers.insert({instance: 'quests', resetTimer})
    }
  }

  return true
}
