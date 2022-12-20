/* eslint-disable no-console */
import { gmail_v1, google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { GaxiosResponse } from 'gaxios'
import { keyBy } from '../../utils/array'
import { authorize } from '../infra'
import { Attachment, MessageSimple } from '../dominio/entity'
import { HeaderEnum, LabelEnum, MimeTypeEnum, user } from './constants'

type LabelsArgs = gmail_v1.Schema$Label[] | undefined

type ParseAttachmentToAttachmentSimpleWithDataArgs = {
  attachmentBody: GaxiosResponse<gmail_v1.Schema$MessagePartBody>;
  attachment: Attachment;
}

type GetAttachmentSimpleWithDataByAttachmentAndMessageIdArgs = {
  attachment: Attachment;
  messageId: string;
}


class Gmail {
  auth: OAuth2Client
  gmail: gmail_v1.Gmail

  constructor(auth: OAuth2Client) {
    this.auth = auth
    this.gmail = google.gmail({ auth: this.auth, version: 'v1' })
  }

  async getLabels(): Promise<LabelsArgs> {
    const res = await this.gmail.users.labels.list({ userId: user.userId })

    return res.data.labels
  }

  async getMessagesByLabelIds(labelIds: string[]): Promise<GaxiosResponse<gmail_v1.Schema$ListMessagesResponse>> {
    const messages = await this.gmail.users.messages.list({ labelIds, userId: user.userId })

    return messages
  }

  async getMessageById(id: string): Promise<GaxiosResponse<gmail_v1.Schema$Message>> {
    const message = await this.gmail.users.messages.get({ id, userId: user.userId })

    return message
  }

  parseMessageToMessageSimple(message: GaxiosResponse<gmail_v1.Schema$Message>): MessageSimple {
    const headers = keyBy(message.data.payload?.headers ?? [], 'name')
    const attachments: Attachment[] = message.data.payload?.parts
      ?.filter((part) => part.mimeType === MimeTypeEnum.APPLICATION_PDF)
      .map(({ filename, mimeType, partId, body }) => ({ attachmentId: body?.attachmentId, filename, mimeType, partId }))
      ?? []


    return {
      attachments,
      body    : message.data.snippet || '',
      date    : headers[HeaderEnum.DATE]?.value || '',
      from    : headers[HeaderEnum.FROM]?.value || '',
      id      : message.data.id || '',
      subject : headers[HeaderEnum.SUBJECT]?.value || '',
      threadId: message.data.threadId || '',
      to      : headers[HeaderEnum.TO]?.value || ''
    }
  }

  async getMessageSimpleById(id: string) {
    const message = await this.getMessageById(id)

    return this.parseMessageToMessageSimple(message)
  }

  async getAttachmentWithDataByIdAndMessageId(args: { attachmentId: string, messageId: string }): Promise<GaxiosResponse<gmail_v1.Schema$MessagePartBody>> {
    const attachment = await this.gmail.users.messages.attachments.get({
      id       : args.attachmentId,
      messageId: args.messageId,
      userId   : user.userId
    })

    return attachment
  }

  parseAttachmentToAttachmentSimpleWithData(args: ParseAttachmentToAttachmentSimpleWithDataArgs): Attachment {
    const { attachmentBody, attachment } = args

    return {
      ...attachment,
      data: attachmentBody.data.data,
      size: attachmentBody.data.size
    }
  }

  async getAttachmentSimpleWithDataByAttachmentAndMessageId(args: GetAttachmentSimpleWithDataByAttachmentAndMessageIdArgs): Promise<Attachment> {
    const { messageId, attachment } = args

    if(!attachment.attachmentId) throw new Error('attachmentId is required')

    const attachmentBody = await this.getAttachmentWithDataByIdAndMessageId({
      attachmentId: attachment.attachmentId,
      messageId
    })

    return this.parseAttachmentToAttachmentSimpleWithData({
      attachment,
      attachmentBody
    })
  }
}

const FLAG_MONITOR = 'GMAIL-API:'
const DIR_DOWNLOAD = 'src/google-api/usecase/download'

async function main() {
  console.log(FLAG_MONITOR, '-----------------------', 'Start', '-----------------------')
  try {
    const authClient = await authorize()
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
      console.log(FLAG_MONITOR, JSON.stringify(messageSimple, null, 2))

      if (!messageSimple.attachments?.length) {
        console.log(FLAG_MONITOR, indexMessage, 'attachments not found')
        // make unread

        return
      }

      const countAttachments = messageSimple.attachments.length
      for (let indexAttachment = 1; indexAttachment <= countAttachments; indexAttachment++) {
        const attachment = messageSimple.attachments[indexAttachment - 1]
        console.log(FLAG_MONITOR, indexMessage, `${indexAttachment}/${countAttachments}:`, attachment.filename)
        const attachmentWithData = await gmail.getAttachmentSimpleWithDataByAttachmentAndMessageId({
          attachment,
          messageId: message.id
        })
        console.log(FLAG_MONITOR, indexMessage, indexAttachment, 'Exists data ', !!attachmentWithData.data)
      }
    }


  } catch (error) {
    console.error(FLAG_MONITOR, error)
  } finally {
    console.log(FLAG_MONITOR, '-----------------------', 'End', '-----------------------')
  }
}

main()