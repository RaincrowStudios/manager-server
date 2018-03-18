const fs = require('fs')

const scripts = {
  addXp: {
    script: fs.readFileSync(__dirname + '/addXp.lua', {encoding:'utf8'})
  },
  adjustEnergy: {
    script: fs.readFileSync(__dirname + '/adjustEnergy.lua', {encoding:'utf8'})
  },
  updateHashFieldArray: {
    script: fs.readFileSync(__dirname + '/updateHashFieldArray.lua', {encoding:'utf8'})
  }
}

module.exports = scripts
