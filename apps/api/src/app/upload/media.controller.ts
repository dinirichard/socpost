import {
    Body,
    Controller,
    Logger,
    Param,
    ParseFilePipeBuilder,
    Post,
    Req,
    Res,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    UsePipes,
} from "@nestjs/common";
import MediaService from "./media.service";
import { MediaDto } from "../../../../libraries/nest/src/lib/dtos/media/media.dto";

import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { PassportJwtAuthGuard } from "../../shared/guards/passport-jwt.guard";
import { CustomUploadPipe } from "@socpost/libraries/nest/lib/pipes/custom.upload.pipe";

import { Multer } from "multer";
import { Request, Response } from 'express';
import handleR2Upload, { simpleUpload } from "./v1.uploader";
import { makeId } from "@socpost/libraries/nest/lib/services/make.is";
import mime from "mime-types";

@Controller("media")
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Post("saveUploads")
    @UseGuards(PassportJwtAuthGuard)
    async saveUploads(
        @Body() body: any,
    ) {
        const { orgId, originalName, uploadUrl, fileType } = body;
        Logger.log(body, 'Body');
        return this.mediaService.saveFile(orgId, originalName, uploadUrl, fileType);
    }

    @Post("uploadImage")
    @UseGuards(PassportJwtAuthGuard)
    @UseInterceptors(FileInterceptor("image"))
    @UsePipes(new CustomUploadPipe())
    async UploadFile(
        @UploadedFile() file: Multer.File,
        @Req() req: Request,
    ) {
        const { orgId } = req.body;
        const key = makeId(7);
        
        const upload = await simpleUpload(file.buffer, key, file.mimetype);

        return this.mediaService.saveFile(orgId, file.originalname, upload, file.mimetype);
    }

    @Post("uploadAnyFiles/:orgId")
    // @UseGuards(PassportJwtAuthGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @UsePipes(new CustomUploadPipe())
    async uploadFiles(
        @UploadedFiles() files : Array<Multer.File>,
        @Req() req: Request,
        @Param('orgId') orgId: string
    ) {
        Logger.log( orgId, 'orgId');
        const media: any[] = [];
        for (const file of files) {
            const key = makeId(10) + '.' + mime.extension(file.mimetype);
            // key.concat(mime.extension(file.mimetype));
            Logger.log( key, 'Key');
            Logger.log( file.buffer, 'file');
            const uploadUrl = await simpleUpload(file.buffer, key, file.mimetype);
            media.push(this.mediaService.saveFile(orgId, file.originalname, uploadUrl, file.mimetype));
        }
        
        return media;
    }

    @Post("uploadYouTubeMedia")
    @UseGuards(PassportJwtAuthGuard)
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
        files: Array<Multer.File>
    ) {
        return console.log({
            body,
            file: files,
        });
    }



    // @UseInterceptors(FileInterceptor('file'))
    // @UsePipes(new CustomFileValidationPipe())
    @Post('/multi/:endpoint')
    @UseGuards(PassportJwtAuthGuard)
    async uploadMultipartFile(
      @Req() req: Request,
      @Res() res: Response,
      @Param('endpoint') endpoint: string
      // @UploadedFile('file')
      // file: Express.Multer.File
    ) {
        const { orgId } = req.body;
        Logger.log( req, endpoint);
        const upload = await handleR2Upload(endpoint, req, res);
        if (endpoint !== 'complete-multipart-upload') {
          return upload;
        }
      
        // @ts-ignore
        const name = upload.Location.split('/').pop();
        // @ts-ignore
        Logger.log( upload.Location.split('.').pop() , 'ContentType');
        // @ts-ignore
        Logger.log( upload , 'Full Location');
      
        // @ts-ignore
        await this.mediaService.saveFile(orgId, name, upload.Location, upload.Location.split('.').pop());
      
        res.status(200).json(upload);
        // const filePath =
        //   file.path.indexOf('http') === 0
        //     ? file.path
        //     : file.path.replace(process.env.UPLOAD_DIRECTORY, '');
        // return this._mediaService.saveFile(org.id, file.originalname, filePath);
    }
}
