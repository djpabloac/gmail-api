import aws from 'aws-sdk'
import axios from 'axios'
import { AssetType } from './constants'
import { TokenS3 } from '../../dominio/entity'

aws.config.update({
  accessKeyId    : process.env.AWS_ACCESS_KEY_ID,
  region         : process.env.AWS_REGION,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

type GetStorageTokenArgs = {
  contentType: string;
  fileName: string;
  assetType: AssetType;
  routeId: string;
};

export default class S3 {
  s3: aws.S3
  bucketDir: string

  constructor() {
    this.s3 = new aws.S3({ signatureVersion: 'v4' })
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

  getStorageToken(args: GetStorageTokenArgs): TokenS3 {
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

    const url = this.s3.getSignedUrl('putObject', {
      ACL        : acl,
      Bucket     : this.bucketDir,
      ContentType: contentType,
      Expires    : 3600,
      Key        : key
    })

    const urlS3 = url.substr(0, url.indexOf('?'))

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