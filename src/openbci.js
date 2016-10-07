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

*/

function openBCI (opts) {
  if (!opts.buffer)
    opts.buffer = 250
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
      if (opts.debug) console.log('found', portName)
      ourBoard.connect(portName)
      ourBoard.on('ready',function() {
        if (opts.debug)
          console.log('connected, ready')
        ourBoard.streamStart()
        ourBoard.on('sample',function(sample) {
          if (opts.debug)
            console.log('volts (index is channel)',
                        sample)
          buff.push(sample)
          if (buff.length==opts.buffer) {
            emitter.emit('reading', {
              type: 'openbci',
              buffer: buff
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
