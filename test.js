#!/usr/bin/env node

const {argv, execSync, spawnSync} = require('./common')

const fs = require('fs')
const path = require('path')

// The configuration and extra args.
let config = 'Default'
let extraArgs = argv
let forceInstallModules = false
let runMainTests = true
let runRendererTests = true
if (argv.length > 0 && !argv[0].startsWith('-')) {
  config = argv[0]
  extraArgs = argv.slice(1)
}
if (argv.includes('--force-install-modules'))
  forceInstallModules = true
if (argv.includes('--only-main-process'))
  runRendererTests = false
if (argv.includes('--only-renderer-process'))
  runMainTests = false

// Install npm modules for tests.
const specDir = path.resolve('src', 'electron', 'spec')
const specMainDir = path.resolve('src', 'electron', 'spec-main')
if (!fs.existsSync(path.join(specDir, 'node_modules')) ||
    !fs.existsSync(path.join(specMainDir, 'node_modules')) ||
    forceInstallModules) {
  const headers = path.resolve('src', 'out', config, 'gen', 'node_headers')
  execSync(`ninja -C src/out/${config} third_party/electron_node:headers`)
  execSync(`npm i --nodedir=${headers}`, {cwd: specDir})
  execSync(`npm i --nodedir=${headers}`, {cwd: specMainDir})
}

// Path to Electron.
let electron = {
  'linux': 'electron',
  'win32': 'electron.exe',
  'darwin': 'Electron.app/Contents/MacOS/Electron',
}[process.platform]

if (runMainTests)
  spawnSync(`src/out/${config}/${electron}`, ['src/electron/spec-main'].concat(extraArgs))
if (runRendererTests)
  spawnSync(`src/out/${config}/${electron}`, ['src/electron/spec'].concat(extraArgs))
