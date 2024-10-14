import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Post, YoutubePostDTO } from "./post.dto";
import { DatabaseService } from "../../database/database.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class PostService {
    constructor(private databaseService: DatabaseService) {}

    // async findUserByOrg(email: string): Promise<Post> {
    //     try {
    //         const user =  await this.databaseService.user.findFirst({
    //             where: {
    //                 email,
    //             }
    //         });

    //         return { 
    //             id : user.id, 
    //             email: user.email, 
    //             password: user.password,
    //             orgId: user.organizationId
    //         } as User;
    //     } catch (error) {
    //         throw new InternalServerErrorException(error, 'There was an error accessing the database');
    //     }  
    // }

    async createYoutubePost(postDto: YoutubePostDTO)  {

        const tags = postDto.tags;

        try {

            const tagsInput: Prisma.TagCreateManyInput[] = postDto.tags.map((val) => {
                if (val.id === ''){
                    return { name: val.name } as Prisma.TagCreateManyInput
                }else {
                    return val as Prisma.TagCreateManyInput;
                }
            });
            
            const post = await this.databaseService.post.create({
                data: {
                    video: postDto.video,
                    videoKind: postDto.videoKind,
                    approval: postDto.approval,
                    publishDate: postDto.publishDate,
                    image: postDto.image,
                    kidsOnly: postDto.forKids,
                    title: postDto.title,
                    description: postDto.description,
                    organization: {
                        connect: {
                            id: postDto.organizationId
                        }
                    },
                    integration: { 
                        connect: {
                            id: postDto.integrationId
                        }
                    }
                }
            });

            Logger.log(post.id, 'Post is successful');

            await this.databaseService.tag.createMany({
                data: tagsInput,
                skipDuplicates: true,
            });

            const savedTags = await this.databaseService.tag.findMany({
                where: {
                    name: {in: tags.map((val) => val.name)}
                }
            });

            Logger.log(savedTags, 'Tags is successful');

            const combined = savedTags.map(val => {
                return {tagId: val.id, postId: post.id};
            });

            const createdconnection = await this.databaseService.tagsOnPosts.createMany({
                data: combined
            });

            Logger.log(createdconnection, 'created connection');


            

        } catch (error) {
            Logger.log(error, 'error');
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }
    }
}
