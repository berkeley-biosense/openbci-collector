var restify = require('restify')
var validate = require('jsonschema').validate
var EventEmitter = require('events').EventEmitter

/*
  10-6-16

  Exposes a function (port, cb)
  Calls `cb` once the server is listening.
  Returns a server,
  which emits events

  - 'post' (an object, representing post request)
  - 'error' (error)

*/

var emitter = new EventEmitter()

var schema = {
  "id": "/Post",
  "type": "object",
  "properties": {
    "type": {"type": "string"},
  },
  "required":["type"]
}

// returns true if valid to indra's schema
function isValid (post) {
  return post && validate(post, schema).errors.length == 0
}

// extends post with {receivedAt: 'ISOString'} and saves it to db
function addReceivedAt (post) {
  var d = new Date()
  post.receivedAt = d.toISOString()
  return post
}

// handles JSON post requests
function handleRequest (req, res, next) {
  // if valid json ->
  if (isValid(req.body)) {
    // add receivedAt timestamp field
    emitter.emit('post', addReceivedAt(req.body))
    // send 202
    res.send(202)
    return next()
  }
  // bad data -> 422 UnprocessableEntityError
  var msg = 'Invalid request.'
  emitter.emit('error', msg)
  return next(
    new restify.UnprocessableEntityError(msg))
}

module.exports = function (port, cb) {
  var server = restify.createServer()
  server.use(restify.bodyParser())
  server.use(restify.CORS())
  // JSON post request route is named /
  server.post('/', handleRequest)
  // when server is listening, call back
  server.listen(port, cb)
  server.on = (ev, cb) => emitter.on(ev, cb)
  return server
}
