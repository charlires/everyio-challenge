import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient()

export default class UserService {

    public getById(email: string): Promise<User> {
        return prisma.user.findFirst({
            where: {
                email: email
            }
        })
    }
}