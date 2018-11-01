const fs = require("fs");

const scripts = {
  updateHashField: {
    script: fs.readFileSync(__dirname + "/updateHashField.lua", {
      encoding: "utf8"
    })
  }
};

module.exports = scripts;
