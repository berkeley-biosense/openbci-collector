var test = require('tape')
var s = null
test('testing server', t => {
  t.plan(6)
  var server = require('../src/server')
  var port = 9998
  s = server(port, function () {
    t.ok(true, 'server is listening')
    var request = require('request-json')
    var hostname = 'http://localhost:' + port + '/'
    var client = request.createClient(hostname)
    s.on('error', (err) => {
      t.ok(err,
           'gets err / bad schema')
    })
    s.on('post', (posted) => {
      t.deepEquals(posted.beep, 'boop',
                  'gets posted / good schema')
    })
    // post 422 bad schema
    client.post('/',
                { beep: 'boop' },
                function (err, res, body) {
                  t.equal(res.statusCode,
                          422,
                          'bad schema data 422')})
    client.post('/',
                { type: 'beep', beep: 'boop' },
                function (err, res, body) {
                  t.notOk(err,
                          'no errors on post')
                  t.equal(res.statusCode,
                          202,
                          'good data 202')})
  })
})


test.onFinish(function () {
  console.log('done')
  s.close()
})
