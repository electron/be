#!/usr/bin/env node

const {argv, execSync} = require('./lib/common')

const path = require('path')

// Make sure sccache server is up.
const sccache = path.resolve('src', 'electron', 'external_binaries', 'sccache')
try {
  execSync(`${sccache}  --start-server`, {stdio: 'pipe'})
} catch (e) {
  // Ignore error of sccache.
}

// The configuration to build.
let config = 'Default'
if (argv.length === 1)
  config = argv[0]

execSync(`ninja -C src/out/${config} electron`)
