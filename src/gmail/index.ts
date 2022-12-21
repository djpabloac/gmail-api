/* eslint-disable no-console */
import FS from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Auth, Gmail } from '../shared/google-api/infra'
import { FileType, LabelEnum } from '../shared/google-api/infra/gmail/constants'

const fs = FS.promises

const ENABLED_PRINT_CONSOLE = process.env.ENABLED_PRINT_CONSOLE === 'true'
const FLAG_MONITOR = 'GMAIL-API:'
const DIR_DOWNLOAD = 'src/gmail/download'

async function main() {
  console.log(FLAG_MONITOR, '-----------------------', 'Start', '-----------------------')
  try {
    console.log(FLAG_MONITOR, 'Create folder download')
    await fs.mkdir(DIR_DOWNLOAD, {recursive: true})
    console.log(FLAG_MONITOR, 'Created')
    console.log(FLAG_MONITOR, '----------------------------------------------------------')

    const authClient = await Auth.authorize()
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
      if(ENABLED_PRINT_CONSOLE) console.log(FLAG_MONITOR, JSON.stringify(messageSimple, null, 2))

      if (!messageSimple.attachments?.length) {
        console.log(FLAG_MONITOR, indexMessage, 'attachments not found')

        await gmail.markAsRead(messageSimple.id)
        console.log(FLAG_MONITOR, indexMessage, 'Marked as read')

        return
      }

      const shortFromEmail = messageSimple.from.substring(0, messageSimple.from.indexOf('@'))
      if(ENABLED_PRINT_CONSOLE) console.log(FLAG_MONITOR, indexMessage, 'shortFromEmail', shortFromEmail)

      const countAttachments = messageSimple.attachments.length
      for (let indexAttachment = 1; indexAttachment <= countAttachments; indexAttachment++) {
        const attachment = messageSimple.attachments[indexAttachment - 1]
        console.log(FLAG_MONITOR, indexMessage, `${indexAttachment}/${countAttachments}:`, attachment.filename)
        const attachmentWithData = await gmail.getAttachmentSimpleWithDataByAttachmentAndMessageId({
          attachment,
          messageId: message.id
        })

        if(!attachmentWithData.mimeType) continue

        const attachmentId = attachmentWithData.attachmentId ? attachmentWithData.attachmentId : uuidv4()
        const fileType = FileType[attachmentWithData.mimeType] ?? 'txt'

        const filename = attachmentWithData.filename ?
          attachmentWithData.filename :
          `gmail_${attachmentId.substring(0, 8)}.${fileType}`

        const relativeDirName = path.join(DIR_DOWNLOAD, shortFromEmail)
        const relativeFileName = path.join(relativeDirName, filename)

        if(!attachmentWithData.data) continue
        await fs.mkdir(relativeDirName, {recursive: true})
        await fs.writeFile(relativeFileName, Buffer.from(attachmentWithData.data, 'base64'))
      }

      await gmail.markAsRead(messageSimple.id)
      console.log(FLAG_MONITOR, indexMessage, 'Marked as read')
    }
  } catch (error) {
    console.error(FLAG_MONITOR, error)
  } finally {
    console.log(FLAG_MONITOR, '-----------------------', 'End', '-----------------------')
  }
}

main()