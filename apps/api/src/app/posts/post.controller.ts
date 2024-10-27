import { Body, Controller, Get, Logger, Param, Post, UseGuards } from "@nestjs/common";
import { PassportJwtAuthGuard } from "../../shared/guards/passport-jwt.guard";
import { file } from "googleapis/build/src/apis/file";
import { PostService } from "./post.service";
import { YoutubePostDTO } from "../../../../libraries/nest/src/lib/dtos/posts/post.dto";

@Controller("posts")
export class PostController {

    constructor(private readonly postService: PostService) {}


    @Get("getPostById/:id")
    @UseGuards(PassportJwtAuthGuard)
    async getPostById(
        @Param() id: string,
    ) {
        Logger.log(id, 'orgId');
        return this.postService.getPostById(id);
    }


    @Get("getPostsByOrg/:orgId")
    @UseGuards(PassportJwtAuthGuard)
    async getPostsByOrg(
        @Param() orgId: any,
    ) {
        Logger.log(orgId, 'orgId Post');
        return this.postService.getPostEventByOrg(orgId.orgId);
    }

    @Get("getPostAndIntegration/:postId")
    @UseGuards(PassportJwtAuthGuard)
    async getPostAndIntegration(
        @Param() postId: any,
    ) {
        Logger.log(postId, 'orgId Post');
        return this.postService.getPostAndIntegration(postId.postId);
    }

    @Post("savePost")
    @UseGuards(PassportJwtAuthGuard)
    async savePost(
        @Body() post: YoutubePostDTO,
    ) {
        Logger.log( post, 'post');
        // Logger.log( orgId, 'orgId');
        // const key = makeId(7);
        
        // const upload = await simpleUpload(file.buffer, key, file.mimetype);

        return this.postService.createYoutubePost(post);
    }
}
