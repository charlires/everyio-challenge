import { Column, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export default class ColumnService {

    public findAll(): Promise<Array<Column>> {
        return prisma.column.findMany({ include: { tasks: true } })
    }

    public add(colunm: Column): Promise<Column> {
        return prisma.column.create({ data: colunm })
    }

    public update(id: string, column: { name: string }): Promise<Column> {
        return prisma.column.update({
            where: {
                id: id,
            },
            data: {
                name: column.name
            }
        })
    }

}