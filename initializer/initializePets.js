const timers = require('../../database/timers')
const getSetFromRedis = require('../utils/getSetFromRedis')
const getAllFromRedis = require('../utils/getAllFromRedis')


async function initializePets() {
  try {
    const pets = await getSetFromRedis('pets')
    if (pets !== []) {
      for (let i = pets.length - 1; i >= 0; i--) {
        const currentTime = Date.now()
        const pet = await getAllFromRedis(pets[i])

        if (pet.info.expiresOn > currentTime) {
          const expireTimer =
            setTimeout(petExpire(pets[i], pet), pet.info.expiresOn)

          timers.insert({pets[i], expireTimer})
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
