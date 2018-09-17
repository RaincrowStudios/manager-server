const timers = require('../database/timers')
const addFieldToHash = require('../redis/addFieldToHash')
const getOneFromList = require('../redis/getOneFromList')
const questReset = require('../manager/quests/questReset')

async function initializeQuests(id, managers) {
  return new Promise(async (resolve, reject) => {
    try {
      const activeQuests = await getOneFromList('constants', 'activeQuests')

      const currentTime = Date.now()

      if (!managers.includes(activeQuests.manager)) {
        await addFieldToHash(activeQuests, 'manager', id)

        const resetTimer =
          setTimeout(() =>
            questReset(),
            activeQuests.expiresOn > currentTime ?
              activeQuests.expiresOn - currentTime : 0
          )

        timers.insert({instance: 'quests', resetTimer})
      }

      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}

module.exports = initializeQuests
