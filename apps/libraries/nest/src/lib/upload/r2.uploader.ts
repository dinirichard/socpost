import {
  UploadPartCommand,
  S3Client,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Progress, Upload } from "@aws-sdk/lib-storage";
// import { Client, ServiceInputTypes, ServiceOutputTypes, MetadataBearer } from "@aws-sdk/types";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Readable, Stream  } from 'stream';
import { Express } from 'express';
import { environment } from '../../environments/environment';
import { makeId } from '../services/make.is';

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ACCESS_KEY,
  CLOUDFLARE_SECRET_ACCESS_KEY,
  CLOUDFLARE_BUCKETNAME,
  CLOUDFLARE_BUCKET_URL,
} = environment;

const R2upload = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  // endpoint: `${CLOUDFLARE_BUCKET_URL}`,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

// export default async function handleR2Upload(
//   endpoint: string,
//   body: any
// ) {
//   switch (endpoint) {
//     case 'create-multipart-upload':
//       return createMultipartUpload(body);
//     // case 'prepare-upload-parts':
//     //   return prepareUploadParts(req, res);
//     case 'complete-multipart-upload':
//       return completeMultipartUpload(body);
//     case 'list-parts':
//       return listParts(body);
//     case 'abort-multipart-upload':
//       return abortMultipartUpload(body);
//     case 'sign-part':
//       return signPart(body);
//   }
// }

export async function simpleUpload(
  data: Blob,
  key: string,
  contentType: string
) {
  try {
              
        const command = new PutObjectCommand( {
          Bucket: CLOUDFLARE_BUCKETNAME,
          Key: key,
          Body: data,
          ContentType: contentType,
        });
        return await R2upload.send(command);
  } catch (error) {
      console.error(error, 'Error');
      throw new Error('Error');
  }
}

export async function createMultipartUpload(body: any ) {
  const { file, fileHash, contentType } = body;
  const filename = makeId(10);

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: `resources/${filename}.${file.type.split('/').at(-1)}`,
      ContentType: contentType,
      Metadata: {
        'x-amz-meta-file-hash': fileHash,
      },
    };

    const command = new CreateMultipartUploadCommand({ ...params });
    const response = await R2upload.send(command);
    console.log(response, 'createMultipartUpload Response')
    return {
      uploadId: response.UploadId,
      key: response.Key,
    };
  } catch (error) {
    console.error(error, 'Error');
    throw new Error('Error');
    // return res.status(500).json({ source: { status: 500 } });
  }
}

// export async function prepareUploadParts(req: Request, res: Response) {
//   const { partData } = req.body;

//   const parts = partData.parts;

//   const response = {
//     presignedUrls: {},
//   };

//   for (const part of parts) {
//     try {
//       const params = {
//         Bucket: CLOUDFLARE_BUCKETNAME,
//         Key: partData.key,
//         PartNumber: part.number,
//         UploadId: partData.uploadId,
//       };
//       const command = new UploadPartCommand({ ...params });
//       const url = await getSignedUrl(R2upload, command, { expiresIn: 3600 });

//       response.presignedUrls[part.number] = url;
//     } catch (err) {
//       Logger.log('Error', err);
//       return res.status(500).json(err);
//     }
//   }

//   return res.status(200).json(response);
// }

export async function listParts(body: any) {
  const { key, uploadId } = body;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      UploadId: uploadId,
    };
    const command = new ListPartsCommand({ ...params });
    const response = await R2upload.send(command);

    return response['Parts'];
  } catch (err) {
    console.log('Error', err);
    throw new Error('Error');
  }
}

export async function completeMultipartUpload(body: any ) {
  const { key, uploadId, parts } = body;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    };

    const command = new CompleteMultipartUploadCommand({ ...params });
    const response = await R2upload.send(command);
    response.Location = CLOUDFLARE_BUCKET_URL + '/' + response?.Location?.split('/').at(-1);
    return response;
  } catch (err) {
    console.log('Error', err);
    throw new Error('Error');
    // return res.status(500).json(err);
  }
}

export async function abortMultipartUpload(body: any ) {
  const { key, uploadId } = body;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      UploadId: uploadId,
    };
    const command = new AbortMultipartUploadCommand({ ...params });
    const response = await R2upload.send(command);

    return response;
  } catch (err) {
    Logger.log('Error', err);
    return false;
  }
}

export async function signPart(body: any) {
    const { key, uploadId } = body;
    const partNumber = parseInt(body.partNumber);
  
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Expires: 3600
    };
  
    const command = new UploadPartCommand({ ...params });
    const url = await getSignedUrl(R2upload, command, { expiresIn: 3600 });
  
    return url;
}
