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
process.chdir(path.dirname(__dirname))

// We are not using toolchain from depot_tools.
process.env.DEPOT_TOOLS_WIN_TOOLCHAIN = 0

// Enable sccache.
process.env.SCCACHE_BUCKET = 'electronjs-sccache'
process.env.SCCACHE_TWO_TIER = 'true'

// Paths to toolchains.
process.env.CHROMIUM_BUILDTOOLS_PATH = path.resolve('src', 'buildtools')
process.env.PATH = `${path.resolve('vendor', 'depot_tools')}${path.delimiter}${process.env.PATH}`

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
