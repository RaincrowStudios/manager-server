const deleteCondition = require('./deleteCondition')

module.exports = (conditions) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (conditions && conditions.length) {
        const conditionsToDelete =
          conditions.map(condition => deleteCondition(condition.instance))
        await Promise.all(conditionsToDelete)
      }
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
