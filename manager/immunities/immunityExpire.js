const getAllFromHash = require('../../redis/getAllFromHash')
const getOneFromHash = require('../../redis/getOneFromHash')
const removeFromActiveSet = require('../../redis/removeFromActiveSet')
const removeHash = require('../../redis/removeHash')
const updateHashFieldArray = require('../../redis/updateHashFieldArray')

module.exports = async (immunityInstance) => {
  try {
    const immunity = await getAllFromHash(immunityInstance)

    if (immunity) {
      const immunityList = await getOneFromHash(immunity.bearer, 'immunityList')
      const index = immunityList
        .map(item => item.caster)
        .indexOf(immunity.caster)

      await Promise.all([
        removeFromActiveSet('immunities', immunityInstance),
        removeHash(immunityInstance),
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
