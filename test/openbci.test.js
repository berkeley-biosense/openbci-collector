var test = require('tape')
var eeg = null
test('can simulate openbci', t => {
  t.plan(3)
  var openbci = require('../src/openbci')
  eeg = openbci({
    debug: false,
    simulate: true,
  })
  eeg.on('error', t.notOk)
  eeg.on('sample', reading => {
    t.ok(reading)
    t.ok(reading.channelData)
    t.equal(reading.channelData.length, 8)
    eeg.removeAllListeners('sample')
  })
})

test.onFinish(function () {
  console.log('done')
  eeg.disconnect()
})
