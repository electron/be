#!/usr/bin/env node

const {argv, targetCpu, execSync, spawnSync} = require('./lib/common')

// The configuration to build.
let config = 'Default'
if (argv.length === 1)
  config = argv[0]
if (targetCpu !== 'x64')
  config += '_' + targetCpu

execSync(`ninja -C src/out/${config}`)
