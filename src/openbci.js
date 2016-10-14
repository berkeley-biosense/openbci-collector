var EventEmitter = require('events').EventEmitter
var OpenBCIBoard = require('openbci').OpenBCIBoard

/*
  10-6-16

  opts is

    {
      debug (boolean)
      chanelVolts (boolean)
      simulate (boolean)
      buffer: (number, 250 by default)
    }

  returns an emitter
  emitter will emit
    - 'reading'
    - 'error'

  emitter also has a method `disconnect()`
  timeSyncPossible = ourBoard.usingVersionTwoFirmware();
*/

function openBCI (opts) {
  if (!opts.buffer)
    opts.buffer = 250
  var ready = false
  var buff = []
  var emitter = new EventEmitter()
  var ourBoard = new OpenBCIBoard({
    simulate: opts.simulate,
  })
  ourBoard
    .autoFindOpenBCIBoard()
    .then(function(portName) {
      if (!portName && !opts.simulate) {
        emitter.emit('error', 'No port found!')
        return
      }
      if (opts.debug)
        console.log('found', portName)
      ourBoard.connect(portName)
      ourBoard.on('ready',function() {
        var sampleRate = ourBoard.sampleRate()
        var canTimeSync = ourBoard.usingVersionTwoFirmware()
        if (opts.debug) {
          console.log('connected, ready')
          console.log('sample rate:', sampleRate)
          console.log('can time sync', canTimeSync)
        }
        ourBoard.streamStart()
        ourBoard.on('sample',function(sample) {
          if (!ready) {
            emitter.emit('ready')
            ready=true
          }
          buff.push(sample)
          if (buff.length==opts.buffer) {
            emitter.emit('reading', {
              type: 'openbci',
              buffer: buff,
              sampleRate: sampleRate,
            })
            buff = []
          }
        })
      })
    })
    .catch(err => emitter.emit("error", err))

  emitter.disconnect = function () {
    ourBoard.streamStop()
      .then(ourBoard.disconnect())
  }

  return emitter
}

module.exports = openBCI
