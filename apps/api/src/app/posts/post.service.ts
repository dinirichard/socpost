import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Post, PostEvent, Tag, YoutubePostDTO } from "../../../../libraries/nest/src/lib/dtos/posts/post.dto";
import { DatabaseService } from "../../database/database.service";
import { Prisma } from "@prisma/client";
import { ProviderResponse } from "../integrations/integration.dto";
import { AnyARecord } from "node:dns";

@Injectable()
export class PostService {
    constructor(private databaseService: DatabaseService) {}

    async getPostById(id: string) {
        try {
            const post =  await this.databaseService.post.findFirst({
                where: {
                    id
                },
            });

            return post as Post;
        } catch (error) {
            throw new InternalServerErrorException(error, 'There was an error accessing the database')
        }
    }

    async getPostEventByOrg(org: string): Promise<PostEvent[]> {
        try {
            const posts =  await this.databaseService.post.findMany({
                where: {
                    organizationId: org 
                },
                select: {
                    id: true,
                    title: true,
                    publishDate: true,
                    integration: {
                        select: {
                            picture: true,
                            providerIdentifier: true,
                        }
                    }
                  },
            });

            return posts.map((post) => {
                return {
                    id : post.id,
                    title : post.title,
                    publishDate: post.publishDate,
                    profileImage: post.integration.picture,
                    provider: post.integration.providerIdentifier,
                } as PostEvent
            })
        } catch (error) {
            Logger.error(error, 'There was an error accessing the database');
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }  
    }

    async getPostAndIntegration(id: string): Promise<[Post, ProviderResponse, any]> {
        try {
            const post =  await this.databaseService.post.findFirst({
                where: {
                    id 
                },
                include: {
                    integration: true,
                    tags: {
                        include: {
                            tag: true,
                        }
                    }
                },
            });

            const mediaId = [ post.image, post.video ];

            const media = await this.databaseService.media.findMany({
                where: {
                    id: { in : mediaId },
                },
            });

            const provider = post.integration as ProviderResponse
            const postResponse = {
                id: post.id,
                integrationId: post.integrationId,
                organizationId: post.organizationId,
                publishDate: post.publishDate,
                state: post.state,
                content: post.content,
                group: post.group,
                title: post.title,
                description: post.description,
                releaseId: post.releaseId,
                releaseUrl: post.releaseUrl,
                settings: post.settings,
                image: post.image,
                video: post.video,
                videoKind: post.videoKind,
                forKids: post.kidsOnly,
                approval: post.approval,
                tags: post.tags.map((val) => val.tag),
            } as Post;

            Logger.log('postResponse', postResponse);
            Logger.log('provider', provider);
            Logger.log('media', media);

            return [postResponse, provider, media];
        } catch (error) {
            Logger.error(error, 'There was an error accessing the database');
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }  
    }

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

            await this.databaseService.tag.createMany({
                data: tagsInput,
                skipDuplicates: true,
            });

            const savedTags = await this.databaseService.tag.findMany({
                where: {
                    name: {in: tags.map((val) => val.name)}
                }
            });

            const combined = savedTags.map(val => {
                return {tagId: val.id, postId: post.id};
            });

            await this.databaseService.tagsOnPosts.createMany({
                data: combined
            });

            return this.getPostEventByOrg(post.organizationId);
        } catch (error) {
            Logger.log(error, 'error');
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }
    }
}
