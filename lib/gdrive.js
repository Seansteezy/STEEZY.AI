import { join, dirname } from 'path'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { EventEmitter } from 'events'
import { google } from 'googleapis'
import { fileURLToPath } from 'url'

// Fix __dirname for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))

// OAuth 2.0 Scopes
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

// Token storage path
const TOKEN_PATH = join(__dirname, '..', 'token.json')

// Default port for OAuth redirect
const port = 3000

class GoogleAuth extends EventEmitter {
  constructor() {
    super()
  }

  async authorize(credentials) {
    const { client_secret, client_id } = credentials
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, `http://localhost:${port}`)

    let token
    try {
      // Read existing token
      token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'))
      oAuth2Client.setCredentials(token)
    } catch (e) {
      console.log('No token found, initiating authentication...')
      const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })
      this.emit('auth', authUrl)

      try {
        const code = await promisify(this.once).bind(this)('token')
        const { tokens } = await oAuth2Client.getToken(code)

        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
        console.log('Token stored successfully.')

        oAuth2Client.setCredentials(tokens)
      } catch (error) {
        console.error('Error retrieving access token:', error)
      }
    }

    return oAuth2Client
  }

  token(code) {
    this.emit('token', code)
  }
}

class GoogleDrive extends GoogleAuth {
  constructor() {
    super()
    this.path = '/drive/api'
  }

  async getFolderID(path) {
    console.log(`Fetching folder ID for: ${path}`)
  }

  async infoFile(path) {
    console.log(`Fetching file info for: ${path}`)
  }

  async folderList(path) {
    console.log(`Listing contents of: ${path}`)
  }

  async downloadFile(path) {
    console.log(`Downloading file: ${path}`)
  }

  async uploadFile(path) {
    console.log(`Uploading file: ${path}`)
  }
}

export { GoogleAuth, GoogleDrive }