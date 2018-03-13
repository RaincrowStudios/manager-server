const client = ('./client')
const scripts = ('../lua/scripts')

module.exports = (instance, xp) => {
  return new Promise((resolve, reject) => {
    client.evalsha(scripts.addXP.sha, 1, instance, xp, (err, result) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(result)
      }
    })
  })
}
