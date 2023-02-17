#!/usr/bin/env node

const {argv, execSync, spawnSync} = require('./common')

const fs = require('fs')
const path = require('path')

// The configuration and extra args.
let config = 'Default'
let extraArgs = argv
let forceInstallModules = false
if (argv.length > 0 && !argv[0].startsWith('-')) {
  config = argv[0]
  extraArgs = argv.slice(1)
}
if (argv.includes('--force-install-modules'))
  forceInstallModules = true

// Install npm modules for tests.
const specDir = path.resolve('src', 'electron', 'spec')
if (!fs.existsSync(path.join(specDir, 'node_modules')) ||
    forceInstallModules) {
  const headers = path.resolve('src', 'out', config, 'gen', 'node_headers')
  execSync(`ninja -C src/out/${config} third_party/electron_node:headers`)
  execSync(`npm i --nodedir=${headers}`, {cwd: specDir})
}

// Path to Electron.
let electron = {
  'linux': 'electron',
  'win32': 'electron.exe',
  'darwin': 'Electron.app/Contents/MacOS/Electron',
}[process.platform]

spawnSync(`src/out/${config}/${electron}`, ['src/electron/spec'].concat(extraArgs))
