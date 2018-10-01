#!/usr/bin/env node

const {argv, execSync} = require('./lib/common')

const path = require('path')

// The configuration and extra args.
let config = 'Debug'
let extraArgs = argv
if (argv.length > 0 && !argv[0].startsWith('-')) {
  config = argv[0]
  extraArgs = argv.slice(1)
}

// Path to Electron.
let electron = {
  'linux': 'electron',
  'win32': 'electron.exe',
  'darwin': 'Electron.app/Contents/MacOS/Electron',
}[process.platform]

execSync(`src/out/${config}/${electron} src/electron/spec ${extraArgs.join(' ')}`)
