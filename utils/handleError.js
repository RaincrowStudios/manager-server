module.exports = (err, res) => {
  console.error(err)

  /*
  informLogger({
    route: 'error',
    error_code: err.message,
    source: 'manager-server',
    content: err.stack
  })
*/

  if (res) {
    const status = err.message[0] === '5' ? 500 : 400
    res.writeHead(status)
    res.write(err.message)
    res.end()
  }
}
