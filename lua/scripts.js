const fs = require('fs')

const scripts = {
  addXP: {
    script: fs.readFileSync(__dirname + '/addXP.lua', {encoding:'utf8'})
  },
  adjustEnergy: {
    script: fs.readFileSync(__dirname + '/adjustEnergy.lua', {encoding:'utf8'})
  }
}

module.exports = scripts
