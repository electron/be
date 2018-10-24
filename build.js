#!/usr/bin/env node

const {argv, execSync} = require('./lib/common')

const path = require('path')

// Make sure sccache server is up.
const sccache = path.resolve('src', 'electron', 'external_binaries', 'sccache')
try {
  execSync(`${sccache}  --start-server`, {stdio: 'pipe'})
} catch (e) {
  // Print error if not the server already running error.
  if (!e.stderr.toString().startsWith('error: Server startup error')) {
    process.stderr.write(`sccache server failed to start:\n${e.stderr}`)
    process.exit(1)
  }
}

// The configuration to build.
let config = 'Default'
if (argv.length === 1)
  config = argv[0]

execSync(`ninja -C src/out/${config} electron`)
