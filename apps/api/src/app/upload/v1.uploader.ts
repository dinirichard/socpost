import {
  UploadPartCommand,
  S3Client,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ACCESS_KEY,
  CLOUDFLARE_SECRET_ACCESS_KEY,
  CLOUDFLARE_BUCKETNAME,
  CLOUDFLARE_BUCKET_URL,
} = process.env;

const R2upload = new S3Client({
  region: 'auto',
  // endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  endpoint: `${CLOUDFLARE_BUCKET_URL}`,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export default async function handleR2Upload(
  endpoint: string,
  req: Request,
  res: Response
) {
  switch (endpoint) {
    case 'create-multipart-upload':
      return createMultipartUpload(req, res);
    case 'prepare-upload-parts':
      return prepareUploadParts(req, res);
    case 'complete-multipart-upload':
      return completeMultipartUpload(req, res);
    case 'list-parts':
      return listParts(req, res);
    case 'abort-multipart-upload':
      return abortMultipartUpload(req, res);
    case 'sign-part':
      return signPart(req, res);
  }
  return res.status(404).end();
}

export async function simpleUpload(
  data: Buffer,
  key: string,
  contentType: string
) {
  const params = {
    Bucket: CLOUDFLARE_BUCKETNAME,
    Key: key,
    Body: data,
    ContentType: contentType,
  };

  const command = new PutObjectCommand({ ...params });
  await R2upload.send(command);

  return CLOUDFLARE_BUCKET_URL + '/' + key;
}

export async function createMultipartUpload(req: Request, res: Response) {
  const { file, fileHash, contentType } = req.body;
  const filename = file.name;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: `resources/${fileHash}/${filename}`,
      ContentType: contentType,
      Metadata: {
        'x-amz-meta-file-hash': fileHash,
      },
    };

    const command = new CreateMultipartUploadCommand({ ...params });
    const response = await R2upload.send(command);
    return res.status(200).json({
      uploadId: response.UploadId,
      key: response.Key,
    });
  } catch (error) {
    Logger.error(error, 'Error');
    return res.status(500).json({ source: { status: 500 } });
  }
}

export async function prepareUploadParts(req: Request, res: Response) {
  return '';
}

export async function completeMultipartUpload(req: Request, res: Response) {
  return '';
}

export async function listParts(req: Request, res: Response) {
  return '';
}

export async function abortMultipartUpload(req: Request, res: Response) {
  return '';
}

export async function signPart(req: Request, res: Response) {
  return '';
}
