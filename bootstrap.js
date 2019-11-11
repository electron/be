#!/usr/bin/env node

const {argv, execSync, spawnSync} = require('./common')

const fs = require('fs')
const path = require('path')

// Parse args.
let skipGclient = false
let noHistory = false
let force = false
let extraArgs = ''
let targetCpu = 'x64'
for (const arg of argv) {
  if (arg === '--skip-gclient')
    skipGclient = true
  else if (arg === '--no-history')
    noHistory = true
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
  let args = noHistory ? '--no-history'
                       : '--with_branch_heads --with_tags'
  if (force)
    args += ' --force'
  // Calling gclient directly would invoke gclient.bat on Windows, which does
  // not work prefectly under some shells.
  execSync(`python vendor/depot_tools/gclient.py sync ${args}`)
}

// Switch to src dir.
process.chdir('src')

// Generate configurations.
const configs = {
  'Release': 'release',
  'Default': 'testing',
}
const sccachePath = path.resolve('electron', 'external_binaries', 'sccache')
for (const name in configs) {
  const config = targetCpu === 'x64' ? name : `${name}_${targetCpu}`
  let gnArgs = `import("//electron/build/args/${configs[name]}.gn") ${extraArgs} target_cpu="${targetCpu}"`
  if (!(targetCpu === 'x86' && process.platform === 'win32'))
    gnArgs += ` cc_wrapper="${sccachePath}"`
  spawnSync('python', ['third_party/depot_tools/gn.py', 'gen', `out/${config}`, `--args=${gnArgs}`])
}
