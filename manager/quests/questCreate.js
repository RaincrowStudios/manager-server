const addEntriesToList = require('../../redis/addEntriesToList')
const getEntriesFromList = require('../../redis/getEntriesFromList')

module.exports = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const expiresOn = await getEntriesFromList('quests', ['expiresOn'])

      const newExpiresOn = expiresOn + 86400

      await addEntriesToList(
        'quests',
        ['expiresOn', 'spellcraft', 'gather', 'explore'],
        [newExpiresOn, newSpellcraft, newGather, newExplore]
      )

      resolve()
    }
    catch (err) {
      reject(err)
    }
  })
}
