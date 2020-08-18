#!/usr/bin/env node

const {argv, execSync} = require('./common')

const fs = require('fs')
const os = require('os')

// The configuration to build.
let config = 'Default'
if (argv.length >= 1)
  config = argv[0]
let target = 'electron'
if (argv.length >= 2)
  target = argv[1]


const outDir = `src/out/${config}`

let jobs = os.cpus().length
const useGoma = fs.readFileSync(outDir + '/args.gn').toString().includes('goma.gn')
if (useGoma) {
  const goma = require('./vendor/build-tools/src/utils/goma')
  goma.auth({})
  goma.ensure()
  jobs = 200
}

execSync(`ninja -j ${jobs} -C ${outDir} ${target}`)
