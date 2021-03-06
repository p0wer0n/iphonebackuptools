const stripAnsi = require('strip-ansi')
const iPhoneBackup = require('../util/iphone_backup.js').iPhoneBackup
const normalizeCols = require('../util/normalize.js')

module.exports.name = 'wifi'
module.exports.description = 'List associated wifi networks and their usage information'

module.exports.func = function (program, base) {
  if (!program.backup) {
    console.log('use -b or --backup <id> to specify backup.')
    process.exit(1)
  }

// Grab the backup
  var backup = iPhoneBackup.fromID(program.backup, base)
  backup.getWifiList()
    .then((items) => {
      if (program.dump) {
        console.log(JSON.stringify(items, null, 4))
        return
      }

      items = items['List of known networks'].map(el => [
        el.lastJoined + '' || '',
        el.lastAutoJoined + '' || '',
        el.SSID_STR + '',
        el.BSSID + '',
        el.SecurityMode || '',
        el.HIDDEN_NETWORK + '',
        el.enabled + ''
      ]).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())

      items = [['Last Joined', 'Last AutoJoined', 'SSID', 'BSSID', 'Security', 'Hidden', 'Enabled'], ['-', '-', '-', '-', '-', '-'], ...items]
      items = normalizeCols(items).map(el => el.join(' | ').replace(/\n/g, '')).join('\n')

      if (!program.color) { items = stripAnsi(items) }

      console.log(items)
    })
    .catch((e) => {
      console.log('[!] Encountered an Error:', e)
    })
}
