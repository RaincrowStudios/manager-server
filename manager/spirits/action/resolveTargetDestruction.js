const updateHashFieldArray = require('../../../redis/updateHashFieldArray')
const informPlayers = require('../../../utils/informPlayers')
const deleteAllConditions = require('../../conditions/deleteAllConditions')
const portalDestroy = require('../../portals/portalDestroy')
const spiritDeath = require('../spiritDeath')

module.exports = (killer, target, spell) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      if (target.type === 'spirit') {
        update.push(spiritDeath(target.instance, killer))
      }
      else if (target.type === 'portal') {
        update.push(portalDestroy(target.instance, killer))
      }
      else {
        if (target.conditions) {
          for (let i = 0; i < target.conditions.length; i++) {
            update.push(
              updateHashFieldArray(
                target.instance,
                'remove',
                'conditions',
                target.conditions[i],
                i
              )
            )
          }
        }

        update.push(
          informPlayers(
            [target.player],
            {
              command: 'character_spell_death',
              caster: killer.id,
              type: killer.type,
              degree: killer.degree,
              spell: spell.id ? spell.id : spell,
              summoner: killer.ownerDisplay ? killer.ownerDisplay : false
            }
          ),
          deleteAllConditions(target.conditions)
        )
      }

      await Promise.all(update)
      resolve(true)
    }
    catch (err) {
      reject(err)
    }
  })
}
