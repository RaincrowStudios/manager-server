const client = ('./client')
const scripts = ('../lua/scripts')

module.exports = (instance, energy) => {
  return new Promise((resolve, reject) => {
    client.evalsha(scripts.adjustEnergy.sha, 1, instance, energy, (err, result) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(result)
      }
    })
  })
}
