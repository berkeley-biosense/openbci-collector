var collector= require('..')({
  port: 8881,     // listen for POST reqs on this port
  simulate: true, // simulate an openBCI
  debug: true,    // console.log gratuitiously
  buffer: 250,    // # of raw EEG readings per buffer
})

collector.on('data', d => {
  console.log('got data!', d)})

collector.on('error', err => {
  console.log('ERR!', err)})

// close
setTimeout(collector.close, 1000)
