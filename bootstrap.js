#!/usr/bin/env node

const {argv, execSync, spawnSync} = require('./common')

const fs = require('fs')
const path = require('path')

// Parse args.
let skipGclient = false
let resetSrc = true
let runHooks = false
let noHistory = false
let noForce = false
for (const arg of argv) {
  if (arg === '--skip-gclient')
    skipGclient = true
  else if (arg === '--no-reset-src')
    resetSrc = false
  else if (arg === '--run-hooks')
    runHooks = true
  else if (arg === '--no-history')
    noHistory = true
  else if (arg === '--no-force')
    noForce = true
}

let gclient = path.join('vendor', 'depot_tools', 'gclient')
if (process.platform === 'win32')
  gclient += '.bat'
if (!skipGclient) {
  // Fetch depot_tools.
  const DEPOT_TOOLS_URL = 'https://chromium.googlesource.com/chromium/tools/depot_tools.git'
  const depotToolsDir = path.join('vendor', 'depot_tools')
  if (fs.existsSync(depotToolsDir)) {
    execSync('git checkout main', {stdio: 'pipe', cwd: depotToolsDir})
    execSync('git pull', {stdio: 'pipe', cwd: depotToolsDir})
  } else {
    execSync(`git clone ${DEPOT_TOOLS_URL} ${depotToolsDir}`)
  }

  // Must bootstrap depot tools on Windows.
  if (process.platform === 'win32')
    execSync(path.join(depotToolsDir, 'bootstrap', 'win_tools.bat'))

  // If the repo is already fetched, try to reset it first.
  if (!noForce) {
    const electronDir = path.join('src', 'electron')
    if (resetSrc && fs.existsSync(electronDir)) {
      // Get the src commit to checkout.
      const deps = String(fs.readFileSync(path.join(electronDir, 'DEPS')))
      const commit = deps.substr(deps.indexOf("'chromium_version':") + 19)
                         .match(/'([0-9a-h\.]+)'/)[1]
      // Reset.
      execSync('git checkout main', {stdio: 'pipe', cwd: 'src'})
      execSync('git fetch', {cwd: 'src'})
      execSync(`git reset --hard 5a5dff63a4a4c63b9b18589819bebb2566c85443`, {stdio: 'pipe', cwd: 'src'})
    }
    const nodeDir = path.join('src', 'third_party', 'electron_node')
    if (fs.existsSync(nodeDir)) {
      // The node dir is somehow messing up with tags, reset to a working commit.
      execSync('git checkout main', {stdio: 'pipe', cwd: nodeDir})
      execSync('git fetch', {cwd: nodeDir})
      execSync('git reset --hard 19064bec34', {stdio: 'pipe', cwd: nodeDir})
    }
    const v8Dir = path.join('src', 'v8')
    if (fs.existsSync(v8Dir)) {
      // Get the V8 commit to checkout.
      const deps = String(fs.readFileSync(path.join('src', 'DEPS')))
      const commit = deps.substr(deps.indexOf("'v8_revision':") + 14)
                         .match(/'([0-9a-h\.]+)'/)[1]
      // Reset.
      execSync('git checkout main', {stdio: 'pipe', cwd: v8Dir})
      execSync('git fetch', {cwd: v8Dir})
      execSync(`git reset --hard 95cbef20e2aa556a1ea75431a48b36c4de6b9934`, {stdio: 'pipe', cwd: v8Dir})
    }
  }

  // Getting the code.
  const args = noHistory ? ['--no-history']
                         : ['--with_branch_heads', '--with_tags']
  if (!noForce)
    args.push('--force')
  spawnSync(gclient,  ['sync'].concat(args), {shell: true})
}

if (skipGclient && runHooks)
  spawnSync(gclient,  ['runhooks'], {shell: true})
