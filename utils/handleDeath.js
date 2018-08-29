const deleteAllConditions = require('../manager/conditions/deleteAllConditions')
const portalDestroy = require('../manager/portals/portalDestroy')
const spiritDeath = require('../manager/spirits/spiritDeath')
const updateHashFieldObject = require('../redis/updateHashFieldObject')
const informPlayers = require('./informPlayers')

module.exports = (target, killer) => {
  return new Promise(async (resolve, reject) => {
    try {
      const update = []
      const inform = []
      let interimUpdate, interimInform

      if (target.type === 'spirit') {
        [interimUpdate, interimInform] = await spiritDeath(target, killer)

        update.push(...interimUpdate)
        inform.push(...interimInform)
      }
      else if (target.type === 'portal') {
        update.push(portalDestroy(target, killer))
      }
      else {
        if (target.conditions) {
          for (const condition of Object.values(target.conditions)) {
            update.push(
              updateHashFieldObject(
                target.instance,
                'remove',
                'conditions',
                condition.instance
              )
            )
          }
        }

        update.push(
          deleteAllConditions(Object.values(target.conditions))
        )

        inform.push(
          {
            function: informPlayers,
            parameters: [
              [target.player],
              {
                command: 'character_death',
                displayName: target.displayName,
                spirit: killer.caster ? killer.caster.spirit : killer.id,
                spell: killer.caster ? killer.id : ''
              }
            ]
          }
        )
      }

      resolve([update, inform])
    }
    catch (err) {
      reject(err)
    }
  })
}
