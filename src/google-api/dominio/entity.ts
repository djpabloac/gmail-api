import { Maybe } from '../../utils/types'

export interface Attachment {
  attachmentId?: Maybe<string>;
  filename?: Maybe<string>;
  mimeType?: Maybe<string>;
  partId?: Maybe<string>;
  data?: Maybe<string>;
  size?: Maybe<number>;
}

export interface MessageSimple {
  attachments: Attachment[];
  body: string;
  date: string;
  from: string;
  id: string;
  subject: string;
  threadId: string;
  to: string;
}