const getOneFromList = require('../../../redis/getOneFromList')
const checkSuccess = require('../../../utils/checkSuccess')
const handleDestroy = require('./handleDestroy')
const handleFail = require('./handleFail')
const handleDukeSpell = require('./handleDukeSpell')

module.exports = (duke, target, action) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []

      if (action === 'destroy') {
        const [destroyUpdate, destroyInform] = await handleDestroy(duke, target)

        update.push(...destroyUpdate)
        inform.push(...destroyInform)
      }
      else if (checkSuccess(duke, target)) {
        const spell = action.id === 'attack' ?
          action :
          await getOneFromList('spells', action.id)

        const [spellUpdate, spellInform] =
          await handleDukeSpell(duke, target, spell)

        update.push(...spellUpdate)
        inform.push(...spellInform)
      }
      else {
        const [failUpdate, failInform] = await handleFail(duke, target)

        update.push(...failUpdate)
        inform.push(...failInform)
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
