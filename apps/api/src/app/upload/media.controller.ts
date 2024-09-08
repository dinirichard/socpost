import {
    Body,
    Controller,
    ParseFilePipeBuilder,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    UsePipes,
} from "@nestjs/common";
import MediaService from "./media.service";
import { Prisma } from "@prisma/client";
import { MediaDto } from "../../../../libraries/nest/src/lib/dtos/media/media.dto";

import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { PassportJwtAuthGuard } from "../../shared/guards/passport-jwt.guard";
import { CustomUploadPipe } from "@socpost/libraries/nest/lib/pipes/custom.upload.pipe";

@Controller("media")
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Post("uploadImage")
    @UseGuards(PassportJwtAuthGuard)
    @UseInterceptors(FileInterceptor("image"))
    UploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
    }

    @Post("uploadAnyFiles")
    @UseGuards(PassportJwtAuthGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @UsePipes(new CustomUploadPipe())
    uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        console.log(files);
    }

    @Post("uploadYouTubeMedia")
    @UseInterceptors(
        AnyFilesInterceptor({
            limits: { files: 2 },
        })
    )
    uploadFilesAndPassValidation(
        @Body() body: MediaDto,
        @UploadedFiles(
            new ParseFilePipeBuilder().build({
                fileIsRequired: true,
            }),
            new ParseFilePipeBuilder().build({
                fileIsRequired: true,
            })
        )
        files: Array<Express.Multer.File>
    ) {
        return console.log({
            body,
            file: files,
        });
    }
}
