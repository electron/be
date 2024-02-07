#!/usr/bin/env node

const path = require('path')

const {argv, spawnSync} = require('./common')

const buildArgs = [
  '--src-dir',
  path.join(__dirname, 'src'),
  '-C',
  'out/Default',
  ...argv,
]
if (!argv.find(arg => !arg.startsWith('--')))
  buildArgs.push('electron')

spawnSync('python', [ 'vendor/build_chromium/build.py', ...buildArgs ])
