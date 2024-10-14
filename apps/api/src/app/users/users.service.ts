import { Injectable, InternalServerErrorException, Logger, } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { User, UserRegisterDTO } from "../auth/auth.dto";
import * as bcrypt from 'bcrypt';





@Injectable()
export class UsersService {
    constructor(private databaseService: DatabaseService) {}

    async findUserByEmail(email: string): Promise<User> {
        try {
            const user =  await this.databaseService.user.findFirst({
                where: {
                    email,
                }
            });

            return { 
                id : user.id, 
                email: user.email, 
                password: user.password,
                orgId: user.organizationId
            } as User;
        } catch (error) {
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }

        
    }

    async createUser(params: UserRegisterDTO): Promise<User>  {
        const saltOrRounds = 10;
        const hashPassword = await bcrypt.hash(params.password, saltOrRounds);

        try {
            const user = await this.databaseService.user.create({
                data: {
                    name: params.name,
                    email: params.email,
                    password: hashPassword,
                    organization: {
                        create: {
                            name: params.organizationName,
                        },
                    },
                },
            });

            return { 
                id : user.id, 
                email: user.email, 
                password: user.password,
                orgId: user.organizationId
            } as User;

        } catch (error) {
            throw new InternalServerErrorException(error, 'There was an error accessing the database');
        }
    }
}
