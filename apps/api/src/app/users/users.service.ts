import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { UserRegisterDTO } from "../auth/auth.dto";

import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export type User = {
    userId: number;
    email: string;
    password: string;
};

//FIXME: Use database
const users: User[] = [
    {
        userId: 1,
        email: "Alice",
        password: "topsecret", //FIXME: Use a hash
    },
    {
        userId: 2,
        email: "Bob",
        password: "123abc", //FIXME: Use a hash
    },
];

@Injectable()
export class UsersService {
    constructor(private databaseService: DatabaseService) {}

    async findUserByEmail(email: string): Promise<User | undefined> {
        return users.find((user) => user.email === email);
    }

    async createUser(params: UserRegisterDTO) {
        const user = await this.databaseService.user.create({
            data: {
                name: params.name,
                email: params.email,
                password: params.password,
                organization: {
                    create: {
                        name: params.organizationName,
                    },
                },
            },
        });


    }
}
