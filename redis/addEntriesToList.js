const client = require('./client')

module.exports = (listName, entries, values) => {
  return new Promise((resolve, reject) => {
    try {
      if (!listName || typeof listName !== 'string') {
        throw new Error('Invalid list: ' + listName)
      }
      else if (!entries || !Array.isArray(entries)) {
        throw new Error('Invalid entries: ' + entries)
      }
      else if (!values || !Array.isArray(values)) {
        throw new Error('Invalid values: ' + values)
      }
      else if (entries.length !== values.length) {
        throw new Error('Entries and values must be the same length')
      }

      const entriesValues = []
      for (let i = 0; i < entries.length; i++) {
        entriesValues.push(entries[i], JSON.stringify(values[i]))
      }

      client.hmset(['list:' + listName, ...entriesValues], (err) => {
        if (err) {
          throw new Error(err)
        }
        else {
          resolve(true)
        }
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
