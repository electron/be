#!/usr/bin/env node

const {argv, execSync} = require('./lib/common')

const path = require('path')

// Make sure sccache server is up.
const sccache = path.resolve('src', 'electron', 'external_binaries', 'sccache')
while (true) {
  try {
    execSync(`${sccache} -s`, {stdio: 'pipe'})
    break
  } catch (e) {
    if (!e.message.includes('error: Connection to server timed out') &&
        !e.message.includes('error: failed to get stats from server')) {
      throw e
    }
  }
}

// The configuration to build.
let config = 'Default'
if (argv.length === 1)
  config = argv[0]

execSync(`ninja -C src/out/${config} electron`)
