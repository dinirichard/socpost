import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import MediaService from "./media.service";
import { CloudflareStorage } from "./cloudfare.storage";
import { diskStorage } from "multer";
import { mkdirSync } from "node:fs";
import { extname } from "node:path";
import { MulterModule } from "@nestjs/platform-express";
import { CustomUploadPipe } from "@socpost/libraries/nest/lib/pipes/custom.upload.pipe";
// import { CustomUploadPipe } from "@socpost/libraries/nest/src/lib/pipes/custom.upload.pipe";

const storage =
    // process.env.CLOUDFLARE_ACCOUNT_ID &&
    // process.env.CLOUDFLARE_ACCESS_KEY &&
    // process.env.CLOUDFLARE_SECRET_ACCESS_KEY &&
    // process.env.CLOUDFLARE_REGION &&
    // process.env.CLOUDFLARE_BUCKETNAME &&
    // process.env.CLOUDFLARE_BUCKET_URL
    //     ? new CloudflareStorage(
    //           process.env.CLOUDFLARE_ACCOUNT_ID,
    //           process.env.CLOUDFLARE_ACCESS_KEY,
    //           process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    //           process.env.CLOUDFLARE_REGION,
    //           process.env.CLOUDFLARE_BUCKETNAME,
    //           process.env.CLOUDFLARE_BUCKET_URL
    //       )
    //     : 
        diskStorage({
            destination: (req, file, cb) => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based, hence +1
                const day = String(now.getDate()).padStart(2, "0");
                const dir = `${process.env.UPLOAD_DIRECTORY}/${year}/${month}/${day}`;
                // Create the directory if it doesn't exist
                mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                // Generate a unique filename here if needed
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join("");
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        });

@Module({
    controllers: [MediaController],
    providers: [MediaService, CustomUploadPipe],
    imports: [
        MulterModule.register({
            storage,
        }),
    ],
})
export class MediaModule {}
