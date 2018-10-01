#!/usr/bin/env node

const {argv, targetCpu, execSync, spawnSync} = require('./lib/common')

const path = require('path')

// Parse args.
let skipGclient = false
let extraArgs = ''
for (const arg of argv) {
  if (arg === '--skip-gclient')
    skipGclient = true
  else if (arg.startsWith('--args='))
    extraArgs = arg.substr(arg.indexOf('=') + 1)
}

// Update submodules.
execSync('git submodule sync --recursive')
execSync('git submodule update --init --recursive')

// Getting the code.
if (!skipGclient)
  execSync('gclient sync --with_branch_heads --with_tags')

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
