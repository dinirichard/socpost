import { Body, Controller, Get, Logger, Param, Post, UseGuards } from "@nestjs/common";
import { PassportJwtAuthGuard } from "../../shared/guards/passport-jwt.guard";
import { file } from "googleapis/build/src/apis/file";
import { PostService } from "./post.service";
import { YoutubePostDTO } from "./post.dto";

@Controller("posts")
export class PostController {

    constructor(private readonly postService: PostService) {}


    @Get("getPostsByOrg/:orgId")
    @UseGuards(PassportJwtAuthGuard)
    async saveUploads(
        @Param() orgId: string,
    ) {
        Logger.log(orgId, 'Body');
        return {};
    }

    @Post("savePost")
    @UseGuards(PassportJwtAuthGuard)
    async UploadAll(
        @Body() post: YoutubePostDTO,
    ) {
        Logger.log( post, 'post');
        // Logger.log( orgId, 'orgId');
        // const key = makeId(7);
        
        // const upload = await simpleUpload(file.buffer, key, file.mimetype);

        return this.postService.createYoutubePost(post);
    }
}
