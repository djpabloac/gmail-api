import { Maybe } from '../../../utils/types'

export interface TokenS3 {
  token: string;
  originalFileName: string;
  fileName: string;
  key: string;
  contentType: string;
  acl: string;
  url: string;
  data?: Maybe<string | Buffer | Uint8Array | Blob>;
}