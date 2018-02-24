const client = require('../redis/client')

module.exports = (instance, item) => {
  return new Promise((resolve, reject) => {
    client.hmset([
      instance,
      'info',
      JSON.stringify(item.info),
      'mapSelection',
      JSON.stringify(item.mapSelection),
      'mapToken',
      JSON.stringify(item.mapToken),
    ], (error) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(true)
      }
    })
  })
}
