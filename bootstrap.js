#!/usr/bin/env node

const {argv, execSync, spawnSync} = require('./lib/common')

const fs = require('fs')
const path = require('path')

// Parse args.
let skipGclient = false
let force = false
let extraArgs = ''
let targetCpu = 'x64'
for (const arg of argv) {
  if (arg === '--skip-gclient')
    skipGclient = true
  else if (arg === '--force')
    force = true
  else if (arg.startsWith('--args='))
    extraArgs = arg.substr(arg.indexOf('=') + 1)
  else if (arg.startsWith('--target-cpu='))
    targetCpu = arg.substr(arg.indexOf('=') + 1)
}

// Fetch depot_tools.
const DEPOT_TOOLS_URL = 'https://chromium.googlesource.com/chromium/tools/depot_tools.git'
if (!fs.existsSync(path.join('vendor', 'depot_tools')))
  execSync(`git clone ${DEPOT_TOOLS_URL} vendor/depot_tools`)

// Getting the code.
if (!skipGclient) {
  let args = ''
  if (force)
    args += ' --force'
  execSync(`gclient sync --with_branch_heads --with_tags ${args}`)
}

// Switch to src dir.
process.chdir('src')

// Generate configurations.
const configs = {
  'Debug': 'debug',
  'Release': 'release',
  'Default': 'testing',
}
const sccachePath = path.resolve('electron', 'external_binaries', 'sccache')
for (const name in configs) {
  const config = targetCpu === 'x64' ? name : `${name}_${targetCpu}`
  const gnArgs = `import("//electron/build/args/${configs[name]}.gn") ${extraArgs} target_cpu="${targetCpu}" cc_wrapper="${sccachePath}"`
  spawnSync('gn', ['gen', `out/${config}`, `--args=${gnArgs}`])
}
