const datastore = require('@google-cloud/datastore')()
/*
  @param {Array} items of
    {Object} with properties
      {String} kind, the kind of the desired entity in the database, and
      {Int || String} id, id of the desied entity
    (i.e. [{kind 'Account', id: 56387442834234], ...])
  @returns {Array} of
    {Object} retreived entity
    (i.e. [[entity], [entity], ...])
*/
module.exports = (items) => {
  return new Promise((resolve, reject) => {
    let keys = []
    for (let item of items) {
      keys.push(datastore.key([item.kind, item.id]))
    }
    datastore.get(keys).then(results => {
      if (!results[0]) {
        const err = { message: 'No entity found', code: '4400' }
        reject(err)
      }
      else {
        let entities = []
        for (let i = 0; i < results[0].length; i++) {
          const entity = {
            key: results[0][i][datastore.KEY],
            data: results[0][i],
          }
          delete entity.data[datastore.KEY]
          entities.push(entity)
        }
        resolve(entities)
      }
    })
  })
}
