const updateHashFieldArray = require('../../../redis/updateHashFieldArray')

module.exports = (spiritInstance, collectible) => {
  return new Promise(async (resolve, reject) => {
      try {

        await updateHashFieldArray(
          spiritInstance,
          'add',
          'carrying',
          collectible.id
        )

        resolve(true)
      }
      catch (err) {
        reject(err)
      }
    })
  }
