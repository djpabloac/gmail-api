/* eslint-disable no-console */
import FS from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../shared/config'
import { Auth, Gmail } from '../shared/google-api/infra'
import { LabelEnum } from '../shared/google-api/infra/gmail/constants'
import { keyBy } from '../utils/array'
import { FileExtensionEnum, FileType } from '../utils/constants'
import { matchPath, urlParse } from '../utils/parse'
import { QueryTypeEnum } from './constants'

const fs = FS.promises

const ENABLED_PRINT_CONSOLE = config.enabledPrintConsole
const ENABLED_UNREAD = config.enabledUnread
const FLAG_MONITOR = 'PROCESS-MESSAGE-UNREAD:'
const PATH_DIRNAME_DOWNLOAD = config.pathDirNameDownload

function getJobIdByLinks(links: string[]): string | null {
  if(!links.length) return null

  const linkParses = links
    .map(urlParse)
    .flatMap((param) => param.query)

  const linkBy = keyBy(linkParses, 'key')

  const linkApplying = linkBy[QueryTypeEnum.URL_EXTERNAL_REDIRECT]?.value ?? ''
  if (!linkApplying) return null

  const [pathName] = linkApplying
    .replace(config.endpoint.applying, '')
    .split('?')

  const params = matchPath<{jobId: string; publication: number}>(pathName, '/job/:jobId/publication/:publication')

  if(!params?.jobId) return null

  return params.jobId
}

const markAsRead = async (args: { messageId: string, index: number }, gmail: Gmail) => {
  if (!ENABLED_UNREAD) return

  const { messageId, index } = args
  await gmail.markAsRead(messageId)
  console.log(FLAG_MONITOR, index, 'Marked as read')
}

export async function processMessageUnread() {
  console.log(FLAG_MONITOR, '-----------------------', 'Start', '-----------------------')
  try {
    console.log(FLAG_MONITOR, 'Create folder download')
    await fs.mkdir(PATH_DIRNAME_DOWNLOAD, { recursive: true })
    console.log(FLAG_MONITOR, 'Created')
    console.log(FLAG_MONITOR, '----------------------------------------------------------')

    const auth = new Auth()
    const authClient = await auth.authorize()
    if (!authClient) throw new Error('Credentials not found')

    const gmail = new Gmail(authClient)

    const labelIds = [LabelEnum.UNREAD]

    const messages = await gmail.getMessagesByLabelIds(labelIds)

    console.log(FLAG_MONITOR, 'Messages:', messages.data.messages?.length || 0)
    if (!messages.data.messages?.length) return

    const countMessages = messages.data.messages.length
    for (let indexMessage = 1; indexMessage <= countMessages; indexMessage++) {
      const message = messages.data.messages[indexMessage - 1]
      console.log(FLAG_MONITOR, `${indexMessage}/${countMessages}`, '-------------------------------------------------')
      if (!message?.id) {
        console.log(FLAG_MONITOR, indexMessage, 'messageId is required')

        continue
      }

      console.log(FLAG_MONITOR, indexMessage, 'Message', message.id, ':')
      const messageSimple = await gmail.getMessageSimpleById(message.id)
      if (ENABLED_PRINT_CONSOLE) console.log(FLAG_MONITOR, JSON.stringify(messageSimple, null, 2))

      const { links } = messageSimple
      const jobId = getJobIdByLinks(links)

      if (!jobId || !messageSimple.attachments?.length) {
        const message = !jobId && !messageSimple.attachments?.length ?
          'jobId and attachments not found' :
          !jobId ?
            'jobId not found' :
            'attachments not found'

        console.log(FLAG_MONITOR, indexMessage, message)
        await markAsRead({ index: indexMessage, messageId: messageSimple.id }, gmail)

        continue
      }

      console.log(FLAG_MONITOR, indexMessage, 'jobId', jobId)

      const shortEmail = `${jobId}/${messageSimple.from.substring(0, messageSimple.from.indexOf('@'))}`
      console.log(FLAG_MONITOR, indexMessage, 'shortEmail', shortEmail)

      const countAttachments = messageSimple.attachments.length
      for (let indexAttachment = 1; indexAttachment <= countAttachments; indexAttachment++) {
        const attachment = messageSimple.attachments[indexAttachment - 1]
        console.log(FLAG_MONITOR, indexMessage, `${indexAttachment}/${countAttachments}:`, attachment.filename)
        const attachmentWithData = await gmail.getAttachmentSimpleWithDataByAttachmentAndMessageId({
          attachment,
          messageId: message.id
        })

        if (!attachmentWithData.mimeType) continue

        const attachmentId = attachmentWithData.attachmentId ? attachmentWithData.attachmentId : uuidv4()
        const fileType = FileType[attachmentWithData.mimeType] ?? FileExtensionEnum.TXT

        const filename = attachmentWithData.filename ?
          attachmentWithData.filename :
          `gmail_${attachmentId.substring(0, 8)}.${fileType}`

        const relativeDirName = path.join(PATH_DIRNAME_DOWNLOAD, shortEmail)
        const relativeFileName = path.join(relativeDirName, filename)

        if (!attachmentWithData.data) continue
        await fs.mkdir(relativeDirName, { recursive: true })
        await fs.writeFile(relativeFileName, Buffer.from(attachmentWithData.data, 'base64'))
      }

      await markAsRead({ index: indexMessage, messageId: messageSimple.id }, gmail)
    }
  } catch (error) {
    console.error(FLAG_MONITOR, error)
  } finally {
    console.log(FLAG_MONITOR, '-----------------------', 'End', '-----------------------')
  }
}