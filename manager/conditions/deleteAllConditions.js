const deleteCondition = require('./deleteCondition')

module.exports = (conditions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []

      if (conditions && conditions.length) {
        const conditionsToDelete =
          conditions.map(condition => deleteCondition(condition.instance))
        update.push(...conditionsToDelete)
      }
      resolve(...update)
    }
    catch (err) {
      reject(err)
    }
  })
}
