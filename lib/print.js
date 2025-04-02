import chalk from 'chalk'
import { watchFile } from 'fs'

// Conditional import for terminal image handling
const terminalImage = global.opts?.['img'] ? await import('terminal-image') : null
// Safe URL regex import
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

// General log function for bot messages with color-coded output
const log = (text, error = false) =>
  console.log(
    chalk[error ? 'red' : 'blue']('[GURU BOT]'),
    chalk[error ? 'redBright' : 'greenBright'](text)
  )

// Main bot function that handles logging
export default async function (m, conn = { user: {} }) {
  try {
    // Get sender name asynchronously
    let senderName = await conn.getName(m.sender)

    // Determine chat name or mark as 'Private'
    let chatName = m.chat && m.chat !== m.sender
      ? m.chat.endsWith('@g.us') 
        ? `${await conn.getName(m.chat)} ` 
        : 'Private'
      : 'Private'

    // Handle command or message logging
    if (m.isCommand) {
      let commandText = m.text.split(' ')[0]
      const cmdtxt = chalk.cyanBright('Command')
      const cmd = chalk.yellowBright(`${commandText}`)
      const from = chalk.greenBright('from')
      const username = chalk.yellowBright(`${senderName}`)
      const ins = chalk.greenBright('in')
      const grp = chalk.blueBright(chatName)
      log(`${cmdtxt} ${cmd} ${from} ${username} ${ins} ${grp}`)
    } else {
      const msg = chalk.cyanBright('Message')
      const from = chalk.greenBright('from')
      const username = chalk.yellowBright(`${senderName}`)
      const ins = chalk.greenBright('in')
      const grp = chalk.blueBright(chatName)
      log(`${msg} ${from} ${username} ${ins} ${grp}`)
    }
  } catch (error) {
    log(`Error: ${error.message}`, true)
  }
}

// Watch for changes to this file and log an update
let file = global.__filename(import.meta.url)
watchFile(file, () => {
  log(chalk.redBright("Update 'lib/print.js'"), false)
})