const fs = require('fs')

const scripts = {
  addExperience: {
    script: fs.readFileSync(__dirname + '/addExperience.lua', {encoding:'utf8'})
  },
  adjustEnergy: {
    script: fs.readFileSync(__dirname + '/adjustEnergy.lua', {encoding:'utf8'})
  },
  moveInGeohash: {
    script: fs.readFileSync(__dirname + '/moveInGeohash.lua', {encoding:'utf8'})
  },
  updateHashField: {
    script: fs.readFileSync(__dirname + '/updateHashField.lua', {encoding:'utf8'})
  },
  updateHashFieldArray: {
    script: fs.readFileSync(__dirname + '/updateHashFieldArray.lua', {encoding:'utf8'})
  }
}

module.exports = scripts
