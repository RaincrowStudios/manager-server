const timers = require('../../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getInfoFromRedis = require('../utils/getInfoFromRedis')


async function initializePets() {
  try {
    const pets = await getSetFromRedis('pets')
    if (pets !== []) {
      for (let i = pets.length - 1; i >= 0; i--) {
        const currentTime = Date.now()
        const pet = await getInfoFromRedis(pets[i])

        if (pet.expiresOn > currentTime) {
          const expireTimer =
            setTimeout(petExpire(pets[i], pet), pet.expiresOn)

          timers.insert({instance: pets[i], expireTimer})
        }
        else {
          petExpire(pets[i], pet)
        }
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}

module.exports = initializePets
