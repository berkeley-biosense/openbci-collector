# openbci-collector

[WIP]

collect raw data from openbci, and expose a port on localhost to listen for POST requests (for metadata about stimulus prsentations)

## quick start

first, set up your open BCI, and plug in the bluetooth dongle

then, clone this repo and

```
npm i 
node example.js
```

## example

```javascript
var collector = require('..')({
  port: 8881,     // listen for POST reqs on this port
  buffer: 250,    // # of raw EEG readings per buffer
  simulate: true, // simulate an openBCI (for debug)
  debug: true,    // console.log gratuitously
})

collector.on('data', d => {
  console.log('got data!', d)})

collector.on('error', err => {
  console.log('ERR!', err)})

// close
setTimeout(collector.close, 1000)
```

data from OpenBCI should be coming through

meanwhile, you can send post requests to `http://localhost:[your port]`. the POSTed json will have to include a "type" string, but can contain anything else. so, this would be valid:

```json
{
  "type": "this-string-is-required",
  "foo": { "bar": "this can be whatever" }
}
```


## license

BSD
