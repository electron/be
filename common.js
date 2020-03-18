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

// Help gn.py find the exe.
process.env.CHROMIUM_BUILDTOOLS_PATH = path.resolve('src', 'buildtools')

if (process.platform === 'win32') {
  // Cleanup the cygwin paths in PATH, otherwise vpython will not work.
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

  // Fix encoding error in python.
  process.env.PYTHONIOENCODING = 'utf-8'

  // HOME may be different under cygwin, so use a fixed path.
  process.env.GOMA_OAUTH2_CONFIG_FILE = path.resolve('.goma_oauth2_config')
}

// Add depot_tools to PATH.
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
