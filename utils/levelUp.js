const getFieldsFromHash = require('../redis/getFieldsFromHash')
const informPlayers = require('./informPlayers')

module.exports = (player, newLevel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const unlockedSpells =
        await getFieldsFromHash('list:spells', newLevel[2])

      const newSpells = unlockedSpells.map(spell => {
        return {
          id: spell.id,
          displayName: spell.displayName,
          school: spell.school,
          level: spell.level,
          degreeReq: spell.degreeReq.toString(10),
          cost: spell.cost.toString(10),
          range: spell.range.toString(10),
          description: spell.description
        }
      })

      resolve(
        informPlayers(
          [player],
          {
            command: 'character_level_up',
            level: newLevel[0],
            baseEnergy: newLevel[1],
            newSpells: newSpells
          }
        )
      )
    }
    catch (err) {
      reject(err)
    }
  })
}
