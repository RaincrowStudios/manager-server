const informLogger = require('./informLogger')

module.exports = (err) => {
  if (err.code !== 'ECONNREFUSED' && err.code !== 'ECONNRESET') {
    if (process.env.NODE_ENV === 'development') {
      console.error(err)
    }
    informLogger({
      route: 'error',
      error_code: err.message,
      source: 'game-server',
      content: err.stack
    })
  }
  return true
}
