#!/usr/bin/env node

const {argv, execSync} = require('./lib/common')

// The configuration to build.
let config = 'Default'
if (argv.length === 1)
  config = argv[0]

execSync(`ninja -C src/out/${config} electron`)
