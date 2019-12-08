#!/usr/bin/env node

const {argv, execSync, spawnSync} = require('./common')

const fs = require('fs')
const path = require('path')

// Parse args.
let skipGclient = false
let noHistory = false
let noDelete = false
let noForce = false
let extraArgs = ''
let targetCpu = 'x64'
for (const arg of argv) {
  if (arg === '--skip-gclient')
    skipGclient = true
  else if (arg === '--no-history')
    noHistory = true
  else if (arg === '--no-delete')
    noDelete = true
  else if (arg === '--no-force')
    noForce = true
  else if (arg.startsWith('--args='))
    extraArgs = arg.substr(arg.indexOf('=') + 1)
  else if (arg.startsWith('--target-cpu='))
    targetCpu = arg.substr(arg.indexOf('=') + 1)
}

if (!skipGclient) {
  // Fetch depot_tools.
  const DEPOT_TOOLS_URL = 'https://chromium.googlesource.com/chromium/tools/depot_tools.git'
  const depotToolsDir = path.join('vendor', 'depot_tools')
  if (fs.existsSync(depotToolsDir))
    execSync('git pull', {stdio: 'pipe', cwd: depotToolsDir})
  else
    execSync(`git clone ${DEPOT_TOOLS_URL} ${depotToolsDir}`)

  // If the repo is already fetched, try to reset it first.
  if (!noForce) {
    const electronDir = path.join('src', 'electron')
    if (fs.existsSync(electronDir)) {
      // Get the chromium commit to checkout.
      const content = String(fs.readFileSync(path.join(electronDir, 'DEPS')))
      const commit = content.substr(content.indexOf("'chromium_version':") + 19)
                            .match(/'([0-9a-h]+)'/)[1]
      // Reset.
      execSync('git checkout master', {stdio: 'pipe', cwd: electronDir})
      execSync('git fetch', {stdio: 'pipe', cwd: electronDir})
      execSync(`git reset --hard ${commit}`, {stdio: 'pipe', cwd: 'src'})
    }
  }

  // Getting the code.
  let args = noHistory ? '--no-history'
                       : '--with_branch_heads --with_tags'
  if (!noDelete)
    args += ' -D'
  if (!noForce)
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
