const spiritDeath = require('../spiritDeath')
const portalDestroy = require('../../portals/portalDestroy')

module.exports = (targetInstance, target, instance) => {
  spiritDeath(targetInstance, target, instance)
  //portalDestroy(targetInstance, target, instance)
}
