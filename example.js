var JSONStream = require('JSONStream')
var writeable = JSONStream.stringify()

var collector = require('.')({
  port: 8881,      // listen for POST reqs on this port
  simulate: true,  // simulate an openBCI
  // debug: true,
  buffer: 10,     // # of raw EEG readings per buffer
})

collector.on('data', d => {
  if (d.type === 'openbci')
    d = d.buffer.map(b => b.channelData)
  writeable.write(d)
})
collector.on('error', writeable.write)
// close after a second
setTimeout(collector.close, 2000)
writeable.pipe(process.stdout)
