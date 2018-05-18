const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromList = require('../../redis/removeFromList')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')

module.exports = async (immunityInstance) => {
  try {
    const immunity = await getOneFromHash('list:immunities', immunityInstance)

    if (immunity) {
      const immunityList = await getOneFromHash(immunity.bearer, 'immunityList')
      const index = immunityList
        .map(item => item.caster)
        .indexOf(immunity.caster)

      await Promise.all([
        removeFromActiveSet('immunities', immunityInstance),
        removeFromList('immunities', immunityInstance),
        updateHashFieldArray(
          immunity.bearer,
          'remove',
          'immunityList',
          immunity,
          index
        )
      ])
    }
  }
  catch (err) {
    console.error(err)
  }
}
