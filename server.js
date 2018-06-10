'use strict'

const http = require('http')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const lua = require('./lua/lua')
const subscriber = require('./redis/subscriber')
const port = process.env.NODE_ENV === 'development' ? 8082 : 80

lua()
initializer()
subscriber()
const server = http.createServer().listen(port)

server.on('request', function(req, res){
  if(req.method == 'POST') {
    req.on('data', function (data) {
      manager(JSON.parse(data))
      res.writeHead(200)
      res.write('OK')
      res.end()
    })
  }
  else {
    res.writeHead(405)
    res.end()
  }
})

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
