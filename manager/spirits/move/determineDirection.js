const targetAll = require('../target/targetAll')
const targetAllies = require('../target/targetAllies')
const targetCharacters = require('../target/targetCharacters')
const targetCollectibles = require('../target/targetCollectibles')
const targetEnemies = require('../target/targetEnemies')
const targetPortals = require('../target/targetPortals')
const targetSpirits = require('../target/targetSpirits')
const determineFlee = require('./determineFlee')

module.exports = (spirit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let destination, direction

      if (spirit.status === 'vulnerable') {
        if (!spirit.attributes || !spirit.attributes.includes('stubborn')) {
          destination = await determineFlee(spirit)

          if (destination) {
            direction = [
              Math.sign(destination.latitude - spirit.latitude),
              Math.sign(destination.longitude - spirit.longitude),
            ]
          }
        }
      }

      if (spirit.attributes && spirit.attributes.includes('cowardly')) {
        destination = await determineFlee(spirit)

        if (destination) {
          direction = [
            Math.sign(destination.latitude - spirit.latitude),
            Math.sign(destination.longitude - spirit.longitude),
          ]
        }
      }

      for (let i = 0; i < spirit.moveTree.length; i++) {
        const directionCategory = spirit.moveTree[i].split(':')
        switch (directionCategory[0]) {
          case 'all':
            destination = await targetAll(spirit)

            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
            }
            break
          case 'attacker':
            if (spirit.lastAttackedBy) {
              destination =
                spirit.lastAttackedBy.type === 'spirit' ?
                  await targetSpirits(spirit, directionCategory[0]) :
                  await targetCharacters(spirit, directionCategory[0])

              if (destination) {
                direction = [
                  Math.sign(destination.latitude - spirit.latitude),
                  Math.sign(destination.longitude - spirit.longitude),
                ]
              }
            }
            break
          case 'previousTarget':
            if (spirit.previousTarget) {
              destination =
                spirit.previousTarget.type === 'spirit' ?
                  await targetSpirits(spirit, directionCategory[0]) :
                  await targetCharacters(spirit, directionCategory[0])

              if (destination) {
                direction = [
                  Math.sign(destination.latitude - spirit.latitude),
                  Math.sign(destination.longitude - spirit.longitude),
                ]
              }
            }
            break
          case 'collectible':
            if (spirit.carrying.length < spirit.maxCarry) {
              destination =
                await targetCollectibles(spirit, directionCategory[1])

              if (destination) {
                direction = [
                  Math.sign(destination.latitude - spirit.latitude),
                  Math.sign(destination.longitude - spirit.longitude),
                ]
              }
            }
            break
          case 'allies':
          case 'vulnerableAllies':
            destination = await targetAllies(spirit, directionCategory[0])

            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
            }
            break
          case 'enemies':
          case 'vulnerableEnemies':
            destination = await targetEnemies(spirit, directionCategory[0])

            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
            }
            break
          case 'spirits':
          case 'allySpirits':
          case 'enemySpirits':
            destination = await targetSpirits(spirit, directionCategory[0])

            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
            }
            break
          case 'summoner':
            direction = 'summoner'
            break
          case 'portals':
            destination = await targetPortals(spirit, directionCategory[0])

            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
            }
            break
          case 'summonLocation':
            direction = [
              Math.sign(spirit.summonLat - spirit.latitude),
              Math.sign(spirit.summonLong - spirit.longitude),
            ]
            break
          case 'vampires':
          case 'witches':
            destination = await targetCharacters(spirit, directionCategory[0])

            if (destination) {
              direction = [
                Math.sign(destination.latitude - spirit.latitude),
                Math.sign(destination.longitude - spirit.longitude),
              ]
            }
            break
          default:
            break
        }
        if (direction) {
          resolve(direction)
        }
      }
      resolve(false)
    }
    catch (err) {
      reject(err)
    }
  })
}
