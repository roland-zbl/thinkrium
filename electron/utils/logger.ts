import log from 'electron-log/main'
import { app } from 'electron'
import path from 'path'

// Optional: Initialize logging for the main process
log.initialize()

// Configure log file location
// By default, electron-log writes to:
// on Linux: ~/.config/{app name}/logs/main.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log
// on macOS: ~/Library/Logs/{app name}/main.log
// The requirement is `{userData}/logs/`.
// userData defaults to the same AppData/Config folder, so we just need to append 'logs'.
// Note: In test environment, app might be undefined if not mocked with getPath
let logPath: string
try {
  if (app) {
    logPath = path.join(app.getPath('userData'), 'logs', 'main.log')
  } else {
    // Fallback for non-electron environment (e.g. tests without full mock)
    logPath = path.join(process.cwd(), 'logs', 'main.log')
  }
} catch (e) {
    // Fallback if app.getPath fails
    logPath = path.join(process.cwd(), 'logs', 'main.log')
}

log.transports.file.resolvePathFn = () => logPath

// Configure log format
// Format: [{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}
const format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
log.transports.file.format = format
log.transports.console.format = format

// Configure levels
// File: info and above
// Console: debug and above (in dev), or info (in prod) -> standard behavior
log.transports.file.level = 'info'
log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info'

// Handle error objects to show stack traces
// electron-log handles this by default, but we can verify.

console.log(`[Logger] Log file path configured to: ${logPath}`)

export default log
