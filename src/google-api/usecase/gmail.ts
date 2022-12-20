/* eslint-disable no-console */
import { gmail_v1, google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { GaxiosResponse } from 'gaxios'
import { authorize } from '../infra'
import { HeaderEnum, LabelEnum, MimeTypeEnum, user } from './constants'
import { keyBy } from '../../utils/array'

type LabelsReturn = gmail_v1.Schema$Label[] | undefined

class Gmail {
  auth: OAuth2Client
  gmail: gmail_v1.Gmail

  constructor(auth: OAuth2Client) {
    this.auth = auth
    this.gmail = google.gmail({ auth: this.auth, version: 'v1' })
  }

  async getLabels(): Promise<LabelsReturn> {
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

  parseMessageToMessageSimple(message: GaxiosResponse<gmail_v1.Schema$Message>) {
    const headers = keyBy(message.data.payload?.headers ?? [], 'name')
    const attachments = message.data.payload?.parts
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

  async getAttachmentsByIdAndMessageId(params: { attachmentId: string, messageId: string }): Promise<GaxiosResponse<gmail_v1.Schema$MessagePartBody>> {
    const attachment = await this.gmail.users.messages.attachments.get({
      id       : params.attachmentId,
      messageId: params.messageId,
      userId   : user.userId
    })

    return attachment
  }
}

const LABEL_MONITOR = 'GMAIL-API:'
async function main() {
  try {
    const authClient = await authorize()
    if (!authClient) throw new Error('Credentials not found')

    const gmail = new Gmail(authClient)

    const labelIds = [LabelEnum.UNREAD]

    const messages = await gmail.getMessagesByLabelIds(labelIds)

    console.log(LABEL_MONITOR, 'Messages:', messages.data.messages?.length || 0)
    if (!messages.data.messages?.length) return

    const [firstMessage] = messages.data.messages
    if (!firstMessage?.id) throw new Error('First message not found')

    console.log(LABEL_MONITOR, 'Message Simple', firstMessage.id, ':')
    const messageSimple = await gmail.getMessageSimpleById(firstMessage.id)
    console.log(LABEL_MONITOR, JSON.stringify(messageSimple, null, 2))
    if (!messageSimple.attachments?.length) return

    const [firstAttachment] = messageSimple.attachments
    if (!firstAttachment?.attachmentId) throw new Error('First attachment not found')

    const attachment = await gmail.getAttachmentsByIdAndMessageId({
      attachmentId: firstAttachment.attachmentId,
      messageId   : messageSimple.id
    })
    console.log(LABEL_MONITOR, JSON.stringify(attachment, null, 2))
  } catch (error) {
    console.log(LABEL_MONITOR, 'Error >', error)
  }
}

main()