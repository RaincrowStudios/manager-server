const resolveDispel = require('./special/resolveDispel')
const resolveGreaterHex = require('./special/resolveGreaterHex')
const resolveInvisibility = require('./special/resolveInvisibility')

module.exports = (caster, target, spell, ingredients) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result
      switch (spell.special) {
        case 'dispel':
          result = await resolveDispel(caster, target, ingredients)
          break
        case 'greaterHex':
          result = await resolveGreaterHex(caster, target, ingredients)
          break
        case 'invisibility':
          result = await resolveInvisibility(caster, target, spell, ingredients)
          break
        default:
          break
      }
      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}
