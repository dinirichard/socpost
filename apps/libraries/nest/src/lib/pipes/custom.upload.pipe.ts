import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { IsArray } from "class-validator";

@Injectable()
export class CustomUploadPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            throw "No file provided.";
        }

        if (IsArray(value)) {
            const values = [...value];
            values.map((v) => {
                if (!v.mimetype) {
                    throw new BadRequestException("Unknown file type.");
                }

                const validation =
                    v.mimetype.startsWith("image/") || v.mimetype.startsWith("video/mp4");
                // && value.size <= maxSize;

                if (validation) {
                    return v;
                }

                throw new BadRequestException("Unsupported file type.");
            });

            return value;
        }

        if (!value.mimetype) {
            return value;
        }

        // Set the maximum file size based on the MIME type
        // const maxSize = this.getMaxSize(value.mimetype);
        const validation =
            value.mimetype.startsWith("image/") || value.mimetype.startsWith("video/mp4");
        // && value.size <= maxSize;

        if (validation) {
            return value;
        }

        // throw new BadRequestException(
        //   `File size exceeds the maximum allowed size of ${maxSize} bytes.`
        // );
        throw new BadRequestException("Unsupported file type.");
    }

    private getMaxSize(mimeType: string): number {
        if (mimeType.startsWith("image/")) {
            return 10 * 1024 * 1024; // 10 MB
        } else if (mimeType.startsWith("video/")) {
            return 1024 * 1024 * 1024; // 1 GB
        } else {
            throw new BadRequestException("Unsupported file type.");
        }
    }
}
