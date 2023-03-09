#!/usr/bin/env node

const {argv, execSync} = require('./common')

const fs = require('fs')
const os = require('os')

let outDir = 'src/out/Default'
const args = argv.filter((arg) => {
  if (arg[0] == arg[0].toUpperCase()) {
    outDir = `src/out/${arg}`
    return false
  } else if (arg.includes('/out/')) {
    outDir = arg
    return false
  } else {
    return true
  }
})

let jobs = os.cpus().length
const useGoma = fs.readFileSync(outDir + '/args.gn').toString().includes('goma.gn')
if (useGoma) {
  const goma = require('./vendor/build-tools/src/utils/goma')
  goma.auth({goma: 'cluster'})
  goma.ensure({goma: 'cluster'})
  jobs = 200
}

execSync(`ninja -j ${jobs} -C ${outDir} ${args.join(' ' )}`)
