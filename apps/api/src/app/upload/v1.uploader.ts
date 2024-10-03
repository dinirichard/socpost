import {
  UploadPartCommand,
  S3Client,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
// import { Client, ServiceInputTypes, ServiceOutputTypes, MetadataBearer } from "@aws-sdk/types";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Readable, Stream  } from 'stream';
import { Multer } from "multer"

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ACCESS_KEY,
  CLOUDFLARE_SECRET_ACCESS_KEY,
  CLOUDFLARE_BUCKETNAME,
  CLOUDFLARE_BUCKET_URL,
} = process.env;

const R2upload = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  // endpoint: `${CLOUDFLARE_BUCKET_URL}`,
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
    // case 'prepare-upload-parts':
    //   return prepareUploadParts(req, res);
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
  data: Multer.File | Buffer,
  key: string,
  contentType: string
) {
  try {
    Logger.log( data, 'data');
    
    const parallelUploads3 = new Upload({
      client: R2upload,
      params: {
          Bucket: CLOUDFLARE_BUCKETNAME,
          ACL: "public-read",
          Key: key,
          Body: data,
          ContentType: contentType,
      },
    },);
  
    const www = await parallelUploads3.done();
    Logger.log( www, 'Upload Done');
  } catch (error) {
    Logger.error(error, 'Error');
    throw new Error('Error');
  }
  // const params = {
  //   Bucket: CLOUDFLARE_BUCKETNAME,
  //   Key: key,
  //   Body: data,
  //   ContentType: contentType,
  // };

  // const command = new PutObjectCommand({ ...params });
  // await R2upload.send(command);

  // const parallelUploads3 = new Upload({
  //   client: R2upload,
  //   params: {
  //       Bucket: CLOUDFLARE_BUCKETNAME,
  //       ACL: "public-read",
  //       Key: key,
  //       Body: stream,
  //       ContentType: contentType,
  //   },
  // },);

  // await parallelUploads3.done();

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

export async function listParts(req: Request, res: Response) {
  const { key, uploadId } = req.body;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      UploadId: uploadId,
    };
    const command = new ListPartsCommand({ ...params });
    const response = await R2upload.send(command);

    return res.status(200).json(response['Parts']);
  } catch (err) {
    Logger.log('Error', err);
    return res.status(500).json(err);
  }
}

export async function completeMultipartUpload(req: Request, res: Response) {
  const { key, uploadId, parts } = req.body;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    };

    const command = new CompleteMultipartUploadCommand({ ...params });
    const response = await R2upload.send(command);
    response.Location = process.env.CLOUDFLARE_BUCKET_URL + '/' + response?.Location?.split('/').at(-1);
    return response;
  } catch (err) {
    Logger.log('Error', err);
    return res.status(500).json(err);
  }
}

export async function abortMultipartUpload(req: Request, res: Response) {
  const { key, uploadId } = req.body;

  try {
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      UploadId: uploadId,
    };
    const command = new AbortMultipartUploadCommand({ ...params });
    const response = await R2upload.send(command);

    return res.status(200).json(response);
  } catch (err) {
    Logger.log('Error', err);
    return res.status(500).json(err);
  }
}

export async function signPart(req: Request, res: Response) {
    const { key, uploadId } = req.body;
    const partNumber = parseInt(req.body.partNumber);
  
    const params = {
      Bucket: CLOUDFLARE_BUCKETNAME,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Expires: 3600
    };
  
    const command = new UploadPartCommand({ ...params });
    const url = await getSignedUrl(R2upload, command, { expiresIn: 3600 });
  
    return res.status(200).json({
      url: url,
    });
}
