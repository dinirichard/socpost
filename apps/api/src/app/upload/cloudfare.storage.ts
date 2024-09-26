import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { makeId } from "@socpost/libraries/nest/lib/services/make.is";
import { Request } from "express";
import concat from "concat-stream";
import mime from "mime-types";
import { StorageEngine, Multer } from "multer";

type CallbackFunction = (error: Error | null, info?: Partial<Multer.File>) => void;

export class CloudflareStorage implements StorageEngine {
    private client: S3Client;

    constructor(
        accountId: string,
        accessKey: string,
        secretKey: string,
        private region: string,
        private _bucketName: string,
        private _uploadUrl: string
    ) {
        this.client = new S3Client({
            endpoint: `${_uploadUrl}`,
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
    }

    public _handleFile(req: Request, file: Multer.File, callback: CallbackFunction): void {
        file.stream.pipe(
            concat({ encoding: "buffer" }, async (data) => {
                callback(
                    null,
                    await this.uploadFile(
                        data,
                        data.length,
                        file.mimetype,
                        mime.extension(file.mimetype)
                    )
                );
            })
        );
    }

    private async uploadFile(
        data: Buffer,
        size: number,
        mime: string,
        extension: string
    ): Promise<Multer.File> {
        const id = makeId(10);
        const command = new PutObjectCommand({
            Bucket: this._bucketName,
            ACL: "public-read",
            Key: `${id}.${extension}`,
            Body: data,
        });

        await this.client.send(command);

        return {
            filename: `${id}.${extension}`,
            mimetype: mime,
            size,
            buffer: data,
            originalname: `${id}.${extension}`,
            fieldname: "file",
            path: `${this._uploadUrl}/${id}.${extension}`,
            destination: `${this._uploadUrl}/${id}.${extension}`,
            encoding: "7bit",
            stream: data as any,
        };
    }

    public _removeFile(
        req: Request,
        file: Multer.File,
        callback: (error: Error | null) => void
    ): void {
        void this.deleteFile(file.destination, callback);
    }

    private async deleteFile(destination: string, callback: CallbackFunction) {
        throw new Error("Method not implemented.");
    }
}
