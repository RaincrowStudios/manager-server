const informLogger = require('./informLogger')

module.exports = (res, err) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err)
  }
  informLogger({
    route: 'error',
    error_code: err.message,
    source: 'game-server',
    content: err.stack
  })
  const status = err.message[0] === '5' ? 500 : 400
  return res.status(status).send(err.message)
}
