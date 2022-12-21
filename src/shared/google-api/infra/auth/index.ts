/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import FS from 'fs'
import path from 'path'
import process from 'process'
import { OAuth2Client } from 'google-auth-library'
import { authenticate } from '@google-cloud/local-auth'
import { google } from 'googleapis'

const fs = FS.promises

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify'
]
const DIR_GMAIL_API = 'src/shared/google-api/infra/auth/credentials'
const TOKEN_PATH = path.join(process.cwd(), `${DIR_GMAIL_API}/token.json`)
const CREDENTIALS_PATH = path.join(process.cwd(), `${DIR_GMAIL_API}/credentials.json`)

class Auth {
  /**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
  private async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      const content = await fs.readFile(TOKEN_PATH)
      const credentials = JSON.parse(content.toString())

      return google.auth.fromJSON(credentials) as OAuth2Client
    } catch (err) {
      return null
    }
  }

  /**
   * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  private async saveCredentials(client: OAuth2Client) {
    const content = await fs.readFile(CREDENTIALS_PATH)
    const keys = JSON.parse(content.toString())
    const key = keys.installed || keys.web
    const payload = JSON.stringify({
      client_id    : key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
      type         : 'authorized_user'
    })

    await fs.writeFile(TOKEN_PATH, payload)
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
  async authorize() {
    const client = await this.loadSavedCredentialsIfExist()
    if (client)
      return client

    const newClient = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes     : SCOPES
    })

    if (newClient.credentials) {
      await this.saveCredentials(newClient)
    }

    return newClient
  }

}

export default new Auth()
