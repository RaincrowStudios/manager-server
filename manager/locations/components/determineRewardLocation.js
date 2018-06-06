const getOneFromList = require('../../../../redis/getOneFromList')

module.exports = (location) => {
  return new Promise(async (resolve, reject) => {
    try {
      const locationTierRewards =
        await getOneFromList('constants', 'locationTierRewards')
      resolve(locationTierRewards[location.tier - 1])
    }
    catch (err) {
      reject(err)
    }
  })
}
