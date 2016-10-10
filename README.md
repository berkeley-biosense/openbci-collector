# openbci-collector

[WIP]

collect raw data from openbci, and expose a port on localhost to listen for POST requests (for metadata about stimulus prsentations)

## quick start

first, clone the repo and install

```
git clone https://github.com/elsehow/openbci-collector
cd openci-collector
npm i 
```

now, simulate an open BCI device, and listen for 'start-recording' on port `8889`, logging data to a directory called `out/`

```
./cmd.js --port=8889 --outdir=out/ --simulate=true
```

to log some data, send a JSON POST request to `http://localhost:8889` with the form:

```python
{
  "type": "start-recording",
  "tag": "breath", # tag - probably task name
  "duration": 12, # duration of recording, in seconds
  "sid": 15, # subject ID
}
```

## complete CLI usage

```sh
./cmd.js --port=[required] --outdir=[required] --simulate=[false] --debug=[true] --buffer=[250]
```

## license

BSD
