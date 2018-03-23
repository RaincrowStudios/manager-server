const deleteCondition = require('./deleteCondition')

module.exports = async (conditions) => {
  try {
    if (conditions && conditions.length > 0) {
      for (const condition of conditions) {
        await deleteCondition(condition.instance)
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}
