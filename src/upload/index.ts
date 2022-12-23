/* eslint-disable no-console */
import FS from 'fs'
import path from 'path'
import process from 'process'
import { config } from '../shared/config'

const fs = FS.promises

const ENABLED_PRINT_CONSOLE = config.enabledPrintConsole
const FLAG_MONITOR = 'PROCESS-UPLOAD:'
const PATH_DIRNAME_DOWNLOAD = path.join(process.cwd(), `${config.pathDirNameDownload}`)

export async function processUpload() {
  console.log(FLAG_MONITOR, '-----------------------', 'Start', '-----------------------')
  try {
    console.log(FLAG_MONITOR, 'Read folder upload')
    const folders = await fs.readdir(PATH_DIRNAME_DOWNLOAD)
    if(!folders.length) {
      console.log(FLAG_MONITOR, 'Folders not found')

      return
    }

    const countFolders = folders.length
    for (let index = 1; index <= countFolders; index++) {
      const subFolder = folders[index - 1]
      console.log(FLAG_MONITOR, `${index}/${countFolders}`, 'Folder', subFolder)
      const pathSubFolder = path.join(PATH_DIRNAME_DOWNLOAD, subFolder)
      const files = await fs.readdir(pathSubFolder)
      if(!ENABLED_PRINT_CONSOLE) {
        console.log(FLAG_MONITOR, files)
      }
    }
  } catch (error) {
    console.error(FLAG_MONITOR, error)
  } finally {
    console.log(FLAG_MONITOR, '-----------------------', 'End', '-----------------------')
  }
}