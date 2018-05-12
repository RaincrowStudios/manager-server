const fs = require('fs')

const scripts = {
  addExperience: {
    script: fs.readFileSync(__dirname + '/addExperience.lua', {encoding:'utf8'})
  },
  addFieldToHash: {
    script: fs.readFileSync(__dirname + '/addFieldToHash.lua', {encoding:'utf8'})
  },
  adjustEnergy: {
    script: fs.readFileSync(__dirname + '/adjustEnergy.lua', {encoding:'utf8'})
  },
  updateHashFieldArray: {
    script: fs.readFileSync(__dirname + '/updateHashFieldArray.lua', {encoding:'utf8'})
  }
}

module.exports = scripts
