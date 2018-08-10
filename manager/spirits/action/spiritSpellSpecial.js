const resolveBanish = require('./special/resolveBanish')
const resolveDispel = require('./special/resolveDispel')
const resolveGreater = require('./special/resolveGreater')

module.exports = (caster, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []
      let interimTotal, interimUpdate, interimInform
      switch (spell.special) {
        case 'banish':
          [interimTotal, interimUpdate, interimInform] = await resolveBanish(caster, target, spell)
          break
        case 'dispel':
          [interimTotal, interimUpdate, interimInform] = resolveDispel(caster, target, spell)
          break
        case 'greater':
          [interimTotal, interimUpdate, interimInform] = await resolveGreater(caster, target, spell)
          break
        default:
          break
      }
      const total = interimTotal
      update.push(...interimUpdate)
      inform.push(...interimInform)

      resolve([total, update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
