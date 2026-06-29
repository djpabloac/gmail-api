import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import axios from 'axios'
import { AssetType } from './constants'
import { TokenS3 } from '../../dominio/entity'

type GetStorageTokenArgs = {
  contentType: string;
  fileName: string;
  assetType: AssetType;
  routeId: string;
};

export default class S3 {
  s3: S3Client
  bucketDir: string

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId    : process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      },
      region: process.env.AWS_REGION || ''
    })
    this.bucketDir = process.env.BUCKET_DIR || ''
  }

  getKeyDir(routeId: string, assetType: AssetType) {
    switch (assetType) {
      case AssetType.AVATAR: {
        return `assets/profile/${routeId}/avatar`
      }
      case AssetType.DOCS: {
        return `assets/profile/${routeId}/docs`
      }
      case AssetType.CV: {
        return `assets/profile/${routeId}/cv`
      }
      default: {
        return `assets/profile/${routeId}/`
      }
    }
  }

  async getStorageToken(args: GetStorageTokenArgs): Promise<TokenS3> {
    const { contentType, fileName, assetType, routeId } = args

    const getDate = new Date()
    const timestamp = getDate
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')

    const relativeFileName = `${timestamp}${fileName.replace(/ /g, '_').replace(new RegExp('/+', 'g'), '/')}`
    const relativeDirName = this.getKeyDir(routeId, assetType)

    const key = `${relativeDirName}/${relativeFileName}`

    const acl = 'public-read'

    const command = new PutObjectCommand({
      ACL        : acl,
      Bucket     : this.bucketDir,
      ContentType: contentType,
      Key        : key
    })

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 })

    const urlS3 = url.substring(0, url.indexOf('?'))

    return {
      acl,
      contentType,
      fileName        : relativeFileName,
      key,
      originalFileName: fileName,
      token           : url,
      url             : urlS3
    }
  }

  async upload(args: TokenS3) {
    const { contentType, acl, token, data } = args
    if(!data) throw new Error('data is required')

    const options = {
      headers: {
        'Content-Type': contentType,
        'x-amz-acl'   : acl
      }
    }

    await axios.put(token, data, options)
  }
}
