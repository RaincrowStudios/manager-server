const getFieldsFromHash = require('../redis/getFieldsFromHash')
const informPlayers = require('./informPlayers')

module.exports = (player, newLevel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [allSpells, baseEnergyByLevel] = await getFieldsFromHash(
        'list:constants',
        ['spellsByLevel', 'baseEnergyByLevel']
      )

      const unlockedSpellIds = []
      for (let i = 0; i < newLevel; i++) {
        unlockedSpellIds.push(...allSpells[i])
      }

      const unlockedSpells =
        await getFieldsFromHash('list:spells', unlockedSpellIds)

      const newSpells = unlockedSpells.map(spell => {
        return {
          id: spell.id,
          displayName: spell.displayName,
          school: spell.school,
          level: spell.level,
          degreeReq: spell.degreeReq ? spell.degreeReq.toString(10) : null,
          cost: spell.cost ? spell.cost.toString(10) : null,
          range: spell.range ? spell.range.toString(10) : null,
          description: spell.description
        }
      })

      resolve(
        informPlayers(
          [player],
          {
            command: 'character_level_up',
            level: newLevel,
            baseEnergy: baseEnergyByLevel[newLevel - 1],
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
