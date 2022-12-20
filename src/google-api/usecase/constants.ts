export const user = {
  userId: 'me'
}

export enum LabelEnum {
  CHAT = 'CHAT',
  SENT = 'SENT',
  INBOX = 'INBOX',
  IMPORTANT = 'IMPORTANT',
  TRASH = 'TRASH',
  DRAFT = 'DRAFT',
  SPAM = 'SPAM',
  CATEGORY_FORUMS = 'CATEGORY_FORUMS',
  CATEGORY_UPDATES = 'CATEGORY_UPDATES',
  CATEGORY_PERSONAL = 'CATEGORY_PERSONAL',
  CATEGORY_PROMOTIONS = 'CATEGORY_PROMOTIONS',
  CATEGORY_SOCIAL = 'CATEGORY_SOCIAL',
  STARRED = 'STARRED',
  UNREAD = 'UNREAD'
}

export enum HeaderEnum {
  DELIVERED_TO = 'Delivered-To',
  RECEIVED = 'Received',
  X_RECEIVED = 'X-Received',
  ARC_SEAL = 'ARC-Seal',
  ARC_MESSAGE_SIGNATURE = 'ARC-Message-Signature',
  ARC_AUTHENTICATION_RESULTS = 'ARC-Authentication-Results',
  RETURN_PATH = 'Return-Path',
  RECEIVED_SPF = 'Received-SPF',
  AUTHENTICATION_RESULTS = 'Authentication-Results',
  DKIM_SIGNATURE = 'DKIM-Signature',
  X_GOOGLE_DKIM_SIGNATURE = 'X-Google-DKIM-Signature',
  X_GM_MESSAGE_STATE = 'X-Gm-Message-State',
  X_GOOGLE_SMTP_SOURCE = 'X-Google-Smtp-Source',
  MIME_VERSION = 'MIME-Version',
  FROM = 'From',
  DATE = 'Date',
  MESSAGE_ID = 'Message-ID',
  SUBJECT = 'Subject',
  TO = 'To',
  CONTENT_TYPE = 'Content-Type'
}

export enum MimeTypeEnum {
  MULTIPART_ALTERNATIVE = 'multipart/alternative',
  APPLICATION_PDF = 'application/pdf',
  APPLICATION_MSWORD = 'application/msword'
}