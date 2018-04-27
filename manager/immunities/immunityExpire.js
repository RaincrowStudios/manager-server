const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeFromHash = require('../../redis/removeFromHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')

module.exports = async (immunityInstance) => {
  try {
    const immunity = await getOneFromHash('list:immunities', immunityInstance)
    if (immunity) {
      console.log('Expiring immunity: %s', immunityInstance)
      const immunityList = await getOneFromHash(immunity.bearer, 'immunityList')
      const index = immunityList.map(item => item.caster).indexOf(immunity.caster)

      await Promise.all([
        removeFromActiveSet('immunities', immunityInstance),
        removeFromHash('list:immunities', immunityInstance),
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
