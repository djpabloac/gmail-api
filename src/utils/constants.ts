export enum MimeTypeEnum {
  MULTIPART_ALTERNATIVE = 'multipart/alternative',
  APPLICATION_PDF = 'application/pdf',
  APPLICATION_MSWORD = 'application/msword',
  APPLICATION_VND_MSWORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TEXT_HTML = 'text/html',
  TEXT_PLAIN = 'text/plain'
}

export enum FileExtensionEnum {
  DOC = 'doc',
  DOCX = 'docx',
  PDF = 'pdf',
  TXT = 'txt'
}

export const FileType = {
  [MimeTypeEnum.APPLICATION_MSWORD.toString()]    : FileExtensionEnum.DOC.toString(),
  [MimeTypeEnum.APPLICATION_VND_MSWORD.toString()]: FileExtensionEnum.DOCX.toString(),
  [MimeTypeEnum.APPLICATION_PDF.toString()]       : FileExtensionEnum.PDF.toString()
}

export const FileExtension = {
  [FileExtensionEnum.DOC.toString()] : MimeTypeEnum.APPLICATION_MSWORD.toString(),
  [FileExtensionEnum.DOCX.toString()]: MimeTypeEnum.APPLICATION_VND_MSWORD.toString(),
  [FileExtensionEnum.PDF.toString()] : MimeTypeEnum.APPLICATION_PDF.toString()
}