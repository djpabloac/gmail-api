/* eslint-disable no-console */
import FS from 'fs'
import path from 'path'
import process from 'process'
import { config } from '../shared/config'
import { S3 } from '../shared/aws/infra'
import { AssetType } from '../shared/aws/infra/s3/constants'
import { FileExtension, MimeTypeEnum } from '../utils/constants'

const fs = FS.promises

const ENABLED_PRINT_CONSOLE = config.enabledPrintConsole
const FLAG_MONITOR = 'PROCESS-UPLOAD:'
const PATH_DIRNAME_DOWNLOAD = path.join(process.cwd(), `${config.pathDirNameDownload}`)

export async function processUpload() {
  console.log(FLAG_MONITOR, '-----------------------', 'Start', '-----------------------')
  try {
    console.log(FLAG_MONITOR, 'Read folder upload')
    const folders = await fs.readdir(PATH_DIRNAME_DOWNLOAD)
    if (!folders.length) {
      console.log(FLAG_MONITOR, 'Folders not found')

      return
    }

    let files: string[] = []

    for (let indexDownload = 0; indexDownload < folders.length; indexDownload++) {
      const dirDownload = folders[indexDownload]
      const pathJob = path.join(PATH_DIRNAME_DOWNLOAD, dirDownload)
      const dirJob = await fs.readdir(pathJob)
      const pathCandidates = dirJob.map((job) => path.join(pathJob, job))
      for (let indexCandidate = 0; indexCandidate < pathCandidates.length; indexCandidate++) {
        const pathCandidate = pathCandidates[indexCandidate]
        const dirFiles = await fs.readdir(pathCandidate)
        const pathFiles = dirFiles.map((files) => path.join(pathCandidate, files))
        files = [...files, ...pathFiles]
      }
    }

    if (ENABLED_PRINT_CONSOLE) console.log(FLAG_MONITOR, files)

    const s3 = new S3()
    const profileId = '63a1d33025d28e0008cb9490'
    for (let indexUpload = 0; indexUpload < files.length; indexUpload++) {
      const pathFile = files[indexUpload]
      const data = await fs.readFile(pathFile)
      const fileName = pathFile.split('/').pop() || new Date().toISOString()
      const fileExtension = fileName.split('.').pop() || MimeTypeEnum.TEXT_PLAIN

      const tokenS3 = s3.getStorageToken({
        assetType  : AssetType.CV,
        contentType: FileExtension[fileExtension] ?? MimeTypeEnum.TEXT_PLAIN,
        fileName,
        routeId    : profileId
      })

      await s3.upload({...tokenS3, data })

      console.log(FLAG_MONITOR, indexUpload, 'tokenS3', tokenS3)
    }
  } catch (error) {
    console.error(FLAG_MONITOR, error)
  } finally {
    console.log(FLAG_MONITOR, '-----------------------', 'End', '-----------------------')
  }
}