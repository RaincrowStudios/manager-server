const getOneFromList = require('../../../../redis/getOneFromList')
const spiritSpellNormal = require('../spiritSpellNormal')

module.exports = (caster, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      let total = 0
      const update = []
      const inform = []
      const newSpell = await getOneFromList('spells', spell.base)

      for (let i = 0; i < 3; i++) {
        const [interimTotal, interimUpdate, interimInform] =
          spiritSpellNormal(caster, target, newSpell)

        total += interimTotal
        update.push(...interimUpdate)
        inform.push(...interimInform)
      }

      resolve([total, update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
