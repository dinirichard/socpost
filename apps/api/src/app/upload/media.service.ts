import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";

@Injectable()
export default class MediaService {
    constructor( private databaseService: DatabaseService) { }

    async saveFile(org: string, fileName: string, filePath: string, fileType: string) {
        // return this._mediaRepository.saveFile(org, fileName, filePath);
        try {
            const media =  await this.databaseService.media.create({
                data: {
                    name: fileName,
                    fileType: fileType,
                    path: filePath,
                    organization: {
                        connect: {
                            id: org
                        }
                    }
                }
            });

            return { 
                id : media.id, 
                name: media.name,
                path: media.path,
                org: media.organizationId
            };
        } catch (error) {
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }
    }

    async getMedia(id: string) {
        try {
            const media =  await this.databaseService.media.findFirst({
                where: {
                    id
                }
            });

            return { 
                id : media.id, 
                name: media.name,
                path: media.path,
                org: media.organizationId
            };
        } catch (error) {
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }
    }
}
