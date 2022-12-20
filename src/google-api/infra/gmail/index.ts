import { gmail_v1, google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { GaxiosResponse } from 'gaxios'
import { keyBy } from '../../../utils/array'
import { Attachment, MessageSimple } from '../../dominio/entity'
import { HeaderEnum, LabelEnum, MimeTypeEnum, user } from './constants'
import { extractEmails } from '../../../utils/regex'

type LabelsArgs = gmail_v1.Schema$Label[] | undefined

type ParseAttachmentToAttachmentSimpleWithDataArgs = {
  attachmentBody: GaxiosResponse<gmail_v1.Schema$MessagePartBody>;
  attachment: Attachment;
}

type GetAttachmentSimpleWithDataByAttachmentAndMessageIdArgs = {
  attachment: Attachment;
  messageId: string;
}

export default class Gmail {
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

    const [from] = extractEmails(headers[HeaderEnum.FROM]?.value || '')
    const [firstTo] = extractEmails(headers[HeaderEnum.TO]?.value || '')

    return {
      attachments,
      body    : message.data.snippet || '',
      date    : headers[HeaderEnum.DATE]?.value || '',
      from,
      id      : message.data.id || '',
      subject : headers[HeaderEnum.SUBJECT]?.value || '',
      threadId: message.data.threadId || '',
      to      : firstTo
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

    if (!attachment.attachmentId) throw new Error('attachmentId is required')

    const attachmentBody = await this.getAttachmentWithDataByIdAndMessageId({
      attachmentId: attachment.attachmentId,
      messageId
    })

    return this.parseAttachmentToAttachmentSimpleWithData({
      attachment,
      attachmentBody
    })
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      id         : messageId,
      requestBody: {
        'removeLabelIds': [ LabelEnum.UNREAD ]
      },
      userId: user.userId
    })
  }

  async markAsUnread(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      id         : messageId,
      requestBody: {
        'addLabelIds': [ LabelEnum.UNREAD ]
      },
      userId: user.userId
    })
  }
}
