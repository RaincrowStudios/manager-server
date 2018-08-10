const informPlayers = require('../../../../utils/informPlayers')

module.exports = (caster, target) => {
  return new Promise(async (resolve, reject) => {
    try {
      const total = 0
      const update = []

      const latitude = (Math.random() > 0.5 ? 1 : -1) *
        (Math.floor(Math.random() * 8505112878) / 100000000)

      const longitude = (Math.random() > 0.5 ? 1 : -1) *
        Math.floor(Math.random() * 180)  + Math.random()

      
      const inform = [{
        function: informPlayers, 
          parameters: [
          [target.player],
          {
            command: 'character_spell_banish',
            latitude: latitude,
            longitude: longitude
          }
        ]
      }]

      resolve([total, update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}