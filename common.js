const fs = require('fs')
const path = require('path')
const {execSync, spawnSync} = require('child_process')

// Parse args.
let verbose = false
const argv = process.argv.slice(2).filter((arg) => {
  if (arg == '-v' || arg == '--verbose') {
    verbose = true
    return false
  } else {
    return true
  }
})

// Switch to root dir.
process.chdir(__dirname)

// We are not using toolchain from depot_tools.
process.env.DEPOT_TOOLS_WIN_TOOLCHAIN = 0

// Enable sccache.
process.env.SCCACHE_BUCKET = 'electronjs-sccache-ci'
process.env.SCCACHE_TWO_TIER = 'true'

// Help gn.py find the exe.
process.env.CHROMIUM_BUILDTOOLS_PATH = path.resolve('src', 'buildtools')

// Cleanup the cygwin paths in PATH, otherwise vpython will not work.
if (process.platform === 'win32') {
  let newPaths = []
  const paths = process.env.PATH.split(path.delimiter)
  for (const p of paths) {
    if (p.startsWith('/'))
      continue
    if (p.includes('cygwin'))
      continue
    newPaths.push(p)
  }
  process.env.PATH = newPaths.join(path.delimiter)
}

// Add depot_tools to PATH.
process.env.PATH = `${path.resolve('vendor', 'depot_tools')}${path.delimiter}${process.env.PATH}`

if (process.platform === 'win32') {
  // Prefer git from depot_tools, the default one could come from cygwin.
  const gitDir = path.resolve('vendor', 'depot_tools', 'win_tools-2_7_6_bin', 'git', 'bin')
  process.env.PATH = `${gitDir}${path.delimiter}${process.env.PATH}`

  // Prefer system python, the one from depot_tools is too old.
  process.env.PATH = `C:\\Python27${path.delimiter}${process.env.PATH}`
}

// Helper around execSync.
const execSyncWrapper = (command, options = {}) => {
  // Print command output by default.
  if (!options.stdio)
    options.stdio = 'inherit'
  // Merge the custom env to global env.
  if (options.env)
    options.env = Object.assign(options.env, process.env)
  return execSync(command, options)
}

const spawnSyncWrapper = (exec, args, options = {}) => {
  // Print command output by default.
  if (!options.stdio)
    options.stdio = 'inherit'
  // Merge the custom env to global env.
  if (options.env)
    options.env = Object.assign(options.env, process.env)
  return spawnSync(exec, args, options)
}

// Don't log out Node.js stack trace.
if (!verbose) {
  process.on('uncaughtException', (error) => {
    console.error('Exit with error:', error.message)
    process.exit(1)
  })
}

// Export public APIs.
module.exports = {
  verbose,
  argv,
  execSync: execSyncWrapper,
  spawnSync: spawnSyncWrapper,
}
