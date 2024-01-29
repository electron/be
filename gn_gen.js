#!/usr/bin/env node

const path = require('path')

const {argv, spawnSync} = require('./common')

const gnArgs = [
  '--src-dir',
  path.join(__dirname, 'src'),
  '--custom-config',
  'Default',
  '--arg',
  'import("//electron/build/args/testing.gn")',
  ...argv,
]

spawnSync('python', [ 'vendor/build_chromium/gn_gen.py', ...gnArgs ])
