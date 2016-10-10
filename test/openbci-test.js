var test = require('tape')
var eeg = null
test('can simulate openbci', t => {
  t.plan(4)
  var openbci = require('../src/openbci')
  eeg = openbci({
    simulate: true,
    debug: true,
    buffer: 250,
  })
  eeg.on('error', t.notOk)
  eeg.on('reading', samples => {
    t.ok(samples)
    t.deepEquals(samples.type, 'openbci')
    t.ok(samples.buffer.length)
    t.equal(samples.buffer[0].channelData.length, 8)
    // console.log(samples)
    eeg.removeAllListeners('reading')
  })
})

test.onFinish(function () {
  console.log('done')
  eeg.disconnect()
})
