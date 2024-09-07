import { Injectable } from '@nestjs/common';

export type User = {
    userId: number;
    email: string;
    password: string;
}

//FIXME: Use database
const users: User[] = [
    {
        userId: 1,
        email: 'Alice',
        password: 'topsecret'  //FIXME: Use a hash
    },
    {
        userId: 2,
        email: 'Bob',
        password: '123abc'  //FIXME: Use a hash
    }
];

@Injectable()
export class UsersService {
    async findUserByEmail(email: string): Promise< User | undefined> {
        return users.find((user) => user.email === email);
    }
}
